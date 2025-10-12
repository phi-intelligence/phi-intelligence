import { useCallback } from 'react';

interface LogLevel {
  debug: boolean;
  info: boolean;
  warn: boolean;
  error: boolean;
}

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

export function useConditionalLogging() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
  const enableLogging = isDevelopment || isDebugMode;

  // Get log levels based on environment
  const getLogLevels = useCallback((): LogLevel => {
    if (isDevelopment) {
      return {
        debug: true,
        info: true,
        warn: true,
        error: true,
      };
    }

    if (isDebugMode) {
      return {
        debug: false, // Still disable debug in production even with debug mode
        info: true,
        warn: true,
        error: true,
      };
    }

    // Production mode - minimal logging
    return {
      debug: false,
      info: false,
      warn: true, // Keep warnings for critical issues
      error: true, // Always log errors
    };
  }, [isDevelopment, isDebugMode]);

  // Create log context
  const createLogContext = useCallback((component?: string, action?: string): LogContext => {
    return {
      component,
      action,
      userId: getUserId(),
      sessionId: getSessionId(),
      timestamp: Date.now(),
    };
  }, []);

  // Debug logging
  const debug = useCallback((message: string, data?: any, component?: string, action?: string) => {
    const levels = getLogLevels();
    if (levels.debug && enableLogging) {
      const context = createLogContext(component, action);
      console.debug(`[DEBUG] ${message}`, { data, context });
    }
  }, [getLogLevels, enableLogging, createLogContext]);

  // Info logging
  const info = useCallback((message: string, data?: any, component?: string, action?: string) => {
    const levels = getLogLevels();
    if (levels.info && enableLogging) {
      const context = createLogContext(component, action);
      console.info(`[INFO] ${message}`, { data, context });
    }
  }, [getLogLevels, enableLogging, createLogContext]);

  // Warning logging
  const warn = useCallback((message: string, data?: any, component?: string, action?: string) => {
    const levels = getLogLevels();
    if (levels.warn) {
      const context = createLogContext(component, action);
      console.warn(`[WARN] ${message}`, { data, context });
      
      // In production, send warnings to monitoring service
      if (!isDevelopment && import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
        sendWarningToMonitoring(message, data, context);
      }
    }
  }, [getLogLevels, isDevelopment, createLogContext]);

  // Error logging
  const error = useCallback((message: string, error?: Error | any, component?: string, action?: string) => {
    const levels = getLogLevels();
    if (levels.error) {
      const context = createLogContext(component, action);
      console.error(`[ERROR] ${message}`, { error, context });
      
      // In production, always send errors to monitoring service
      if (!isDevelopment && import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
        sendErrorToMonitoring(message, error, context);
      }
    }
  }, [getLogLevels, isDevelopment, createLogContext]);

  // Performance logging
  const performance = useCallback((operation: string, duration: number, component?: string, action?: string) => {
    const levels = getLogLevels();
    if (levels.info && enableLogging) {
      const context = createLogContext(component, action);
      console.info(`[PERF] ${operation} took ${duration}ms`, { duration, context });
      
      // In production, send performance data to monitoring service
      if (!isDevelopment && import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
        sendPerformanceToMonitoring(operation, duration, context);
      }
    }
  }, [getLogLevels, enableLogging, isDevelopment, createLogContext]);

  // API call logging
  const apiCall = useCallback((method: string, url: string, duration: number, status: number, component?: string) => {
    const levels = getLogLevels();
    if (levels.info && enableLogging) {
      const context = createLogContext(component, 'api_call');
      console.info(`[API] ${method} ${url} - ${status} (${duration}ms)`, { 
        method, 
        url, 
        duration, 
        status, 
        context 
      });
      
      // In production, send API metrics to monitoring service
      if (!isDevelopment && import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
        sendApiMetricsToMonitoring(method, url, duration, status, context);
      }
    }
  }, [getLogLevels, enableLogging, isDevelopment, createLogContext]);

  // User action logging
  const userAction = useCallback((action: string, details?: any, component?: string) => {
    const levels = getLogLevels();
    if (levels.info && enableLogging) {
      const context = createLogContext(component, action);
      console.info(`[USER] ${action}`, { details, context });
      
      // In production, send user actions to analytics service
      if (!isDevelopment && import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
        sendUserActionToAnalytics(action, details, context);
      }
    }
  }, [getLogLevels, enableLogging, isDevelopment, createLogContext]);

  // Get user ID from storage or context
  const getUserId = useCallback(() => {
    try {
      return localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }, []);

  // Get session ID
  const getSessionId = useCallback(() => {
    try {
      let sessionId = sessionStorage.getItem('monitoring_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('monitoring_session_id', sessionId);
      }
      return sessionId;
    } catch {
      return 'unknown';
    }
  }, []);

  // Send warning to monitoring service
  const sendWarningToMonitoring = useCallback(async (message: string, data: any, context: LogContext) => {
    try {
      await fetch('/api/monitoring/warnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, data, context }),
      });
    } catch {
      // Silently fail if monitoring service is unavailable
    }
  }, []);

  // Send error to monitoring service
  const sendErrorToMonitoring = useCallback(async (message: string, error: any, context: LogContext) => {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          } : error,
          context 
        }),
      });
    } catch {
      // Silently fail if monitoring service is unavailable
    }
  }, []);

  // Send performance data to monitoring service
  const sendPerformanceToMonitoring = useCallback(async (operation: string, duration: number, context: LogContext) => {
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, duration, context }),
      });
    } catch {
      // Silently fail if monitoring service is unavailable
    }
  }, []);

  // Send API metrics to monitoring service
  const sendApiMetricsToMonitoring = useCallback(async (
    method: string, 
    url: string, 
    duration: number, 
    status: number, 
    context: LogContext
  ) => {
    try {
      await fetch('/api/monitoring/api-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, url, duration, status, context }),
      });
    } catch {
      // Silently fail if monitoring service is unavailable
    }
  }, []);

  // Send user action to analytics service
  const sendUserActionToAnalytics = useCallback(async (action: string, details: any, context: LogContext) => {
    try {
      await fetch('/api/analytics/user-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, details, context }),
      });
    } catch {
      // Silently fail if analytics service is unavailable
    }
  }, []);

  return {
    debug,
    info,
    warn,
    error,
    performance,
    apiCall,
    userAction,
    isDevelopment,
    isDebugMode,
    enableLogging,
    getLogLevels,
  };
}

// Hook for component-specific logging
export function useComponentLogging(componentName: string) {
  const logger = useConditionalLogging();

  return {
    debug: (message: string, data?: any, action?: string) => 
      logger.debug(message, data, componentName, action),
    info: (message: string, data?: any, action?: string) => 
      logger.info(message, data, componentName, action),
    warn: (message: string, data?: any, action?: string) => 
      logger.warn(message, data, componentName, action),
    error: (message: string, error?: Error | any, action?: string) => 
      logger.error(message, error, componentName, action),
    performance: (operation: string, duration: number, action?: string) => 
      logger.performance(operation, duration, componentName, action),
    apiCall: (method: string, url: string, duration: number, status: number) => 
      logger.apiCall(method, url, duration, status, componentName),
    userAction: (action: string, details?: any) => 
      logger.userAction(action, details, componentName),
  };
}
