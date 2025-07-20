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

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Auto-flush logs every 30 seconds
    setInterval(() => this.flushLogs(), 30000);
    
    // Flush logs before page unload
    window.addEventListener('beforeunload', () => this.flushLogs());
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
      metadata,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  private async log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry(level, message, context, metadata);
    entry.userId = await this.getUserId();

    // Console output based on level
    const consoleMethod = level === LogLevel.ERROR || level === LogLevel.CRITICAL ? 'error' :
                         level === LogLevel.WARN ? 'warn' : 'log';
    
    console[consoleMethod](`[${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${message}`, metadata || '');

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
      // Log performance data to our table
      const performanceLogs = logsToFlush.map(log => ({
        query_type: `log_${log.level}`,
        execution_time_ms: 0,
        user_id: log.userId
      }));

      // For now, just log to console since types aren't updated yet
      console.log('Performance logs:', performanceLogs);

      // For development, also log to console
      if (process.env.NODE_ENV === 'development') {
        console.group('📊 Flushing Logs to Database');
        logsToFlush.forEach(log => {
          console.log(`[${log.level}] ${log.context ? `[${log.context}] ` : ''}${log.message}`, log.metadata);
        });
        console.groupEnd();
      }
    } catch (error) {
      console.error('Failed to flush logs to database:', error);
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

  // Performance logging
  async logQueryPerformance(queryType: string, executionTime: number, userId?: string) {
    try {
      // For now, just log to console since types aren't updated yet
      console.log(`Query Performance: ${queryType} - ${executionTime}ms`, { userId });
    } catch (error) {
      console.error('Failed to log query performance:', error);
    }
  }

  // Network request logging
  logNetworkRequest(url: string, method: string, duration: number, status: number, error?: string) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `${method} ${url} - ${status} (${duration}ms)`, 'network', {
      url,
      method,
      duration,
      status,
      error
    });
  }
}

export const logger = new Logger();

// Performance measurement utilities
export function measurePerformance<T>(
  operation: () => Promise<T> | T,
  operationName: string,
  context?: string
): Promise<T> {
  const start = performance.now();
  
  const logResult = (result: T) => {
    const duration = performance.now() - start;
    logger.info(`${operationName} completed in ${duration.toFixed(2)}ms`, context, { duration });
    logger.logQueryPerformance(operationName, Math.round(duration));
    return result;
  };

  const logError = (error: any) => {
    const duration = performance.now() - start;
    logger.error(`${operationName} failed after ${duration.toFixed(2)}ms`, context, { 
      duration, 
      error: error.message,
      stack: error.stack 
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

// Retry with exponential backoff
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
        logger.error(`Operation failed after ${maxRetries} attempts`, context, {
          error: lastError.message,
          attempts: maxRetries
        });
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`, context, {
        error: lastError.message,
        attempt,
        delay
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}