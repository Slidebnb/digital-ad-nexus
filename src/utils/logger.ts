
import { supabase } from '@/integrations/supabase/client';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
}

class Logger {
  private sessionId: string;
  private logQueue: LogEntry[] = [];
  private isFlushingLogs = false;
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Auto-flush logs every 30 seconds in production, 10 seconds in development
    const flushInterval = this.isDevelopment ? 10000 : 30000;
    setInterval(() => this.flushLogs(), flushInterval);
    
    // Flush logs before page unload
    window.addEventListener('beforeunload', () => this.flushLogs());
    
    // Flush critical logs immediately
    window.addEventListener('error', (event) => {
      this.critical(`Uncaught error: ${event.error?.message || event.message}`, 'Global', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
  }

  private async getUserId(): Promise<string | undefined> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    } catch {
      return undefined;
    }
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      context,
      metadata: this.sanitizeMetadata(metadata),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined;
    
    // Remove sensitive data and circular references
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      try {
        // Skip functions and complex objects that might cause issues
        if (typeof value === 'function') continue;
        if (value instanceof HTMLElement) continue;
        if (value instanceof Event) continue;
        
        // Sanitize sensitive fields
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          sanitized[key] = '[REDACTED]';
          continue;
        }
        
        // Truncate long strings
        if (typeof value === 'string' && value.length > 1000) {
          sanitized[key] = value.substring(0, 1000) + '...';
          continue;
        }
        
        // Handle objects carefully
        if (typeof value === 'object' && value !== null) {
          try {
            JSON.stringify(value); // Test if serializable
            sanitized[key] = value;
          } catch {
            sanitized[key] = '[Object]';
          }
        } else {
          sanitized[key] = value;
        }
      } catch {
        sanitized[key] = '[Error serializing value]';
      }
    }
    
    return sanitized;
  }

  private async log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry(level, message, context, metadata);
    entry.userId = await this.getUserId();

    // Console output with proper formatting
    const consoleMethod = level === LogLevel.ERROR || level === LogLevel.CRITICAL ? 'error' :
                         level === LogLevel.WARN ? 'warn' : 
                         level === LogLevel.DEBUG && !this.isDevelopment ? null : 'log';
    
    if (consoleMethod) {
      const prefix = `[${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;
      const timestamp = new Date().toLocaleTimeString('de-DE');
      
      if (metadata && Object.keys(metadata).length > 0) {
        console[consoleMethod](`${timestamp} ${prefix} ${message}`, metadata);
      } else {
        console[consoleMethod](`${timestamp} ${prefix} ${message}`);
      }
    }

    // Add to queue for database logging
    this.logQueue.push(entry);

    // For critical errors, flush immediately
    if (level === LogLevel.CRITICAL || level === LogLevel.ERROR) {
      this.flushLogs();
    }
  }

  private async flushLogs() {
    if (this.isFlushingLogs || this.logQueue.length === 0) return;
    
    this.isFlushingLogs = true;
    const logsToFlush = [...this.logQueue];
    this.logQueue = [];

    try {
      // In development, also log to console group
      if (this.isDevelopment && logsToFlush.length > 0) {
        console.group(`📊 Flushing ${logsToFlush.length} Logs`);
        logsToFlush.forEach(log => {
          const timestamp = new Date(log.timestamp).toLocaleTimeString('de-DE');
          console.log(`${timestamp} [${log.level}] ${log.context ? `[${log.context}] ` : ''}${log.message}`, log.metadata || '');
        });
        console.groupEnd();
      }

      // For production, we could send logs to a logging service
      // For now, we'll store basic metrics in our performance tracking
      const performanceLogs = logsToFlush.map(log => ({
        query_type: `log_${log.level}`,
        execution_time_ms: 0,
        user_id: log.userId
      }));

      // Store critical errors for admin review
      const criticalLogs = logsToFlush.filter(log => 
        log.level === LogLevel.CRITICAL || log.level === LogLevel.ERROR
      );

      if (criticalLogs.length > 0) {
        // TODO: Send critical logs to admin notification system
        console.error(`${criticalLogs.length} critical logs detected`, criticalLogs);
      }

    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add failed logs to queue
      this.logQueue.unshift(...logsToFlush);
    } finally {
      this.isFlushingLogs = false;
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, metadata);
  }

  critical(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.CRITICAL, message, context, metadata);
  }

  // Performance logging with better error handling
  async logQueryPerformance(queryType: string, executionTime: number, userId?: string) {
    try {
      this.debug(`Query performance: ${queryType}`, 'Performance', {
        executionTime: Math.round(executionTime),
        userId,
        performanceGrade: executionTime < 100 ? 'excellent' : 
                         executionTime < 500 ? 'good' : 
                         executionTime < 1000 ? 'fair' : 'poor'
      });
    } catch (error) {
      console.error('Failed to log query performance:', error);
    }
  }

  // Network request logging with status categorization
  logNetworkRequest(url: string, method: string, duration: number, status: number, error?: string) {
    const level = status >= 500 ? LogLevel.ERROR :
                 status >= 400 ? LogLevel.WARN :
                 status >= 300 ? LogLevel.INFO : LogLevel.DEBUG;
    
    const statusCategory = status >= 200 && status < 300 ? 'success' :
                          status >= 300 && status < 400 ? 'redirect' :
                          status >= 400 && status < 500 ? 'client_error' :
                          status >= 500 ? 'server_error' : 'unknown';

    this.log(level, `${method} ${url} - ${status} (${duration}ms)`, 'Network', {
      url,
      method,
      duration: Math.round(duration),
      status,
      statusCategory,
      error,
      slow: duration > 2000
    });
  }
}

export const logger = new Logger();

// Performance measurement with better error handling
export function measurePerformance<T>(
  operation: () => Promise<T> | T,
  operationName: string,
  context?: string
): Promise<T> {
  const start = performance.now();
  
  const logResult = (result: T) => {
    const duration = performance.now() - start;
    logger.info(`${operationName} completed`, context || 'Performance', { 
      duration: Math.round(duration),
      success: true
    });
    logger.logQueryPerformance(operationName, duration);
    return result;
  };

  const logError = (error: any) => {
    const duration = performance.now() - start;
    logger.error(`${operationName} failed`, context || 'Performance', { 
      duration: Math.round(duration), 
      error: error?.message || String(error),
      stack: error?.stack
    });
    throw error;
  };

  try {
    const result = operation();
    if (result instanceof Promise) {
      return result.then(logResult).catch(logError);
    } else {
      return Promise.resolve(logResult(result));
    }
  } catch (error) {
    return Promise.reject(logError(error));
  }
}

// Enhanced retry with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: string
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        logger.error(`Operation failed after ${maxRetries} attempts`, context || 'Retry', {
          error: lastError.message,
          attempts: maxRetries,
          finalAttempt: true
        });
        throw lastError;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000); // Cap at 10 seconds
      logger.warn(`Operation failed, retrying`, context || 'Retry', {
        error: lastError.message,
        attempt,
        maxRetries,
        delay,
        nextAttemptIn: `${delay}ms`
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
