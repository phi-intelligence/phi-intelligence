import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToFirstByte: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'navigation' | 'form_submit' | 'error';
  timestamp: number;
  element?: string;
  details?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  context?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

export function useProductionMonitoring() {
  const startTime = useRef<number>(Date.now());
  const interactions = useRef<UserInteraction[]>([]);
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Initialize performance monitoring
  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
      initializePerformanceMonitoring();
    }

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, []);

  // Initialize performance monitoring
  const initializePerformanceMonitoring = useCallback(() => {
    // Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        performanceObserver.current = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              const fcp = entry as PerformanceEntry;
              console.log('FCP:', fcp.startTime);
            }
          }
        });
        performanceObserver.current.observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const lcp = entry as PerformanceEntry;
            console.log('LCP:', lcp.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          console.log('CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance monitoring initialization failed:', error);
      }
    }
  }, []);

  // Track page load performance
  const trackPageLoad = useCallback(() => {
    if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        timeToFirstByte: navigation.responseStart - navigation.requestStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        largestContentfulPaint: 0, // Will be updated by observer
        cumulativeLayoutShift: 0, // Will be updated by observer
      };

      // Send metrics to monitoring service
      sendPerformanceMetrics(metrics);
    }
  }, []);

  // Track user interactions
  const trackInteraction = useCallback((type: UserInteraction['type'], element?: string, details?: Record<string, any>) => {
    if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
      const interaction: UserInteraction = {
        type,
        timestamp: Date.now(),
        element,
        details,
      };

      interactions.current.push(interaction);

      // Send interaction data periodically or on navigation
      if (interactions.current.length >= 10) {
        sendUserInteractions(interactions.current);
        interactions.current = [];
      }
    }
  }, []);

  // Track errors
  const trackError = useCallback((error: Error, context?: string, componentStack?: string) => {
    if (import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
      const errorReport: ErrorReport = {
        message: error.message,
        stack: error.stack,
        componentStack,
        context,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      sendErrorReport(errorReport);
    }
  }, []);

  // Track navigation
  const trackNavigation = useCallback((from: string, to: string) => {
    trackInteraction('navigation', undefined, { from, to });
  }, [trackInteraction]);

  // Track form submissions
  const trackFormSubmission = useCallback((formId: string, success: boolean, details?: Record<string, any>) => {
    trackInteraction('form_submit', formId, { success, ...details });
  }, [trackInteraction]);

  // Send performance metrics to monitoring service
  const sendPerformanceMetrics = useCallback(async (metrics: PerformanceMetrics) => {
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metrics,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          sessionId: getSessionId(),
        }),
      });
    } catch (error) {
      // Silently fail in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send performance metrics:', error);
      }
    }
  }, []);

  // Send user interactions to monitoring service
  const sendUserInteractions = useCallback(async (interactions: UserInteraction[]) => {
    try {
      await fetch('/api/monitoring/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactions,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          sessionId: getSessionId(),
        }),
      });
    } catch (error) {
      // Silently fail in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send user interactions:', error);
      }
    }
  }, []);

  // Send error reports to monitoring service
  const sendErrorReport = useCallback(async (errorReport: ErrorReport) => {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...errorReport,
          sessionId: getSessionId(),
        }),
      });
    } catch (error) {
      // Silently fail in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send error report:', error);
      }
    }
  }, []);

  // Get or create session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('monitoring_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('monitoring_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackInteraction('navigation', undefined, { action: 'page_hidden' });
      } else {
        trackInteraction('navigation', undefined, { action: 'page_visible' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [trackInteraction]);

  // Track beforeunload to send final data
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Send any remaining interactions
      if (interactions.current.length > 0) {
        sendUserInteractions(interactions.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sendUserInteractions]);

  // Track page load completion
  useEffect(() => {
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, [trackPageLoad]);

  return {
    trackInteraction,
    trackError,
    trackNavigation,
    trackFormSubmission,
    trackPageLoad,
    sendPerformanceMetrics,
    sendUserInteractions,
    sendErrorReport,
  };
}

// Hook for tracking specific component performance
export function useComponentPerformance(componentName: string) {
  const startTime = useRef<number>(Date.now());
  const { trackInteraction } = useProductionMonitoring();

  useEffect(() => {
    const mountTime = Date.now() - startTime.current;
    
    if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
      trackInteraction('navigation', componentName, { 
        action: 'component_mount',
        mountTime 
      });
    }

    return () => {
      const unmountTime = Date.now() - startTime.current;
      
      if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
        trackInteraction('navigation', componentName, { 
          action: 'component_unmount',
          unmountTime 
        });
      }
    };
  }, [componentName, trackInteraction]);

  return {
    trackComponentAction: (action: string, details?: Record<string, any>) => {
      trackInteraction('click', componentName, { action, ...details });
    },
  };
}
