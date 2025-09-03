import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

interface NavigationMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private isEnabled = process.env.NODE_ENV === 'development';

  recordRender(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;
    
    this.metrics.push({
      componentName,
      renderTime,
      timestamp: Date.now(),
    });

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log slow renders
    if (renderTime > 16) { // > 16ms (60fps threshold)
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getComponentStats(componentName: string) {
    const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
    if (componentMetrics.length === 0) return null;

    const renderTimes = componentMetrics.map(m => m.renderTime);
    const avg = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const max = Math.max(...renderTimes);
    const min = Math.min(...renderTimes);

    return {
      count: componentMetrics.length,
      avgRenderTime: avg,
      maxRenderTime: max,
      minRenderTime: min,
      recentRenders: componentMetrics.slice(-10),
    };
  }

  getNavigationMetrics(): NavigationMetrics | null {
    if (typeof window === 'undefined' || !window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');

    if (!navigation) return null;

    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0;
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const largestContentfulPaint = lcpEntries.length > 0 
      ? (lcpEntries[lcpEntries.length - 1] as any).startTime 
      : 0;

    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstPaint,
      firstContentfulPaint,
      largestContentfulPaint,
    };
  }

  clear() {
    this.metrics = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook to monitor component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStartRef = useRef<number>();

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      performanceMonitor.recordRender(componentName, renderTime);
    }
  });

  return useCallback(() => {
    return performanceMonitor.getComponentStats(componentName);
  }, [componentName]);
}

/**
 * Hook to monitor page load performance
 */
export function usePageLoadPerformance() {
  useEffect(() => {
    const recordPageLoad = () => {
      const metrics = performanceMonitor.getNavigationMetrics();
      if (metrics && process.env.NODE_ENV === 'development') {
        console.group('📊 Page Load Performance');
        console.log('Load Time:', `${metrics.loadTime.toFixed(2)}ms`);
        console.log('DOM Content Loaded:', `${metrics.domContentLoaded.toFixed(2)}ms`);
        console.log('First Paint:', `${metrics.firstPaint.toFixed(2)}ms`);
        console.log('First Contentful Paint:', `${metrics.firstContentfulPaint.toFixed(2)}ms`);
        if (metrics.largestContentfulPaint > 0) {
          console.log('Largest Contentful Paint:', `${metrics.largestContentfulPaint.toFixed(2)}ms`);
        }
        console.groupEnd();
      }
    };

    // Record metrics after page load
    if (document.readyState === 'complete') {
      recordPageLoad();
    } else {
      window.addEventListener('load', recordPageLoad);
      return () => window.removeEventListener('load', recordPageLoad);
    }
  }, []);

  return useCallback(() => {
    return performanceMonitor.getNavigationMetrics();
  }, []);
}

/**
 * Hook to measure async operation performance
 */
export function useAsyncPerformance() {
  return useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${operationName} took ${duration.toFixed(2)}ms`);
        
        if (duration > 1000) {
          console.warn(`🐌 Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
        }
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms`, error);
      }
      
      throw error;
    }
  }, []);
}

/**
 * Hook to monitor memory usage (if available)
 */
export function useMemoryMonitor() {
  const getMemoryInfo = useCallback(() => {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      };
    }
    return null;
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const memInfo = getMemoryInfo();
        if (memInfo && memInfo.usedJSHeapSize > 100) { // Alert if > 100MB
          console.log(`🧠 Memory usage: ${memInfo.usedJSHeapSize}MB / ${memInfo.totalJSHeapSize}MB`);
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [getMemoryInfo]);

  return getMemoryInfo;
}

export default performanceMonitor;