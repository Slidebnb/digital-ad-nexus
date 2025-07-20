import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { logger, retryWithBackoff } from '@/utils/logger';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  attempts: number;
  lastError: Error | null;
}

export function useRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    onRetry,
    onMaxRetriesReached
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempts: 0,
    lastError: null
  });

  const execute = useCallback(async (): Promise<T> => {
    setState(prev => ({ ...prev, isRetrying: true, attempts: 0, lastError: null }));
    
    try {
      const result = await retryWithBackoff(
        async () => {
          try {
            return await operation();
          } catch (error) {
            setState(prev => ({ 
              ...prev, 
              attempts: prev.attempts + 1,
              lastError: error as Error 
            }));
            
            onRetry?.(state.attempts + 1, error as Error);
            throw error;
          }
        },
        maxRetries,
        baseDelay,
        'useRetry'
      );
      
      setState(prev => ({ ...prev, isRetrying: false }));
      return result;
    } catch (error) {
      const err = error as Error;
      setState(prev => ({ ...prev, isRetrying: false, lastError: err }));
      
      onMaxRetriesReached?.(err);
      toast.error(`Vorgang fehlgeschlagen nach ${maxRetries} Versuchen: ${err.message}`);
      throw err;
    }
  }, [operation, maxRetries, baseDelay, onRetry, onMaxRetriesReached, state.attempts]);

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      attempts: 0,
      lastError: null
    });
  }, []);

  return {
    execute,
    reset,
    ...state
  };
}

// Circuit breaker pattern
interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state = CircuitState.CLOSED;
  private readonly options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      monitoringPeriod: 60000, // 1 minute
      ...options
    };
  }

  async execute<T>(operation: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        logger.info('Circuit breaker transitioning to HALF_OPEN', 'circuit-breaker');
      } else {
        const error = new Error('Circuit breaker is OPEN');
        logger.warn('Circuit breaker prevented operation', 'circuit-breaker', {
          state: this.state,
          failureCount: this.failureCount
        });
        
        if (fallback) {
          logger.info('Using fallback for circuit breaker', 'circuit-breaker');
          return fallback();
        }
        throw error;
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      if (fallback) {
        logger.info('Using fallback after circuit breaker opened', 'circuit-breaker');
        return fallback();
      }
      
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      logger.info('Circuit breaker reset to CLOSED', 'circuit-breaker');
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      logger.error('Circuit breaker opened due to failures', 'circuit-breaker', {
        failureCount: this.failureCount,
        threshold: this.options.failureThreshold
      });
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Hook for circuit breaker
export function useCircuitBreaker<T>(
  operation: () => Promise<T>,
  fallback?: () => T,
  options?: Partial<CircuitBreakerOptions>
) {
  const [circuitBreaker] = useState(() => new CircuitBreaker(options));

  const execute = useCallback(async (): Promise<T> => {
    return circuitBreaker.execute(operation, fallback);
  }, [circuitBreaker, operation, fallback]);

  const getState = useCallback(() => {
    return circuitBreaker.getState();
  }, [circuitBreaker]);

  return { execute, getState };
}