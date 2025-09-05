// src/lib/performance.ts
// Performance monitoring and optimization utilities

// Lazy loading utility for heavy components
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const React = require('react');
  return React.lazy(importFn);
}

// Debounce utility for search and input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Image optimization utility
export function getOptimizedImageUrl(
  src: string,
  width: number,
  height?: number,
  quality = 75
): string {
  if (!src) return '';
  
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  });
  
  if (height) {
    params.set('h', height.toString());
  }
  
  return `/_next/image?${params.toString()}`;
}

// Virtual scrolling for large lists
export class VirtualList {
  private itemHeight: number;
  private containerHeight: number;
  private scrollTop: number = 0;
  
  constructor(itemHeight: number, containerHeight: number) {
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
  }
  
  getVisibleRange(totalItems: number): { start: number; end: number } {
    const start = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - 2);
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight) + 4;
    const end = Math.min(totalItems, start + visibleCount);
    
    return { start, end };
  }
  
  updateScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop;
  }
  
  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight;
  }
  
  getOffsetY(index: number): number {
    return index * this.itemHeight;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startMeasure(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }
  
  endMeasure(name: string): number {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      const duration = measure.duration;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);
      
      // Clean up
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      
      return duration;
    }
    return 0;
  }
  
  getAverageTime(name: string): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  logMetrics(): void {
    console.table(
      Array.from(this.metrics.entries()).map(([name, times]) => ({
        operation: name,
        calls: times.length,
        average: this.getAverageTime(name).toFixed(2) + 'ms',
        total: times.reduce((sum, time) => sum + time, 0).toFixed(2) + 'ms',
      }))
    );
  }
}

// Web Workers for heavy computations
export function createWorker(workerFunction: Function): Worker {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript',
  });
  
  return new Worker(URL.createObjectURL(blob));
}

// Service Worker registration for caching
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Bundle size analysis helper
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
      console.log('Bundle analysis available in development mode');
    });
  }
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
    const memory = (window.performance as any).memory;
    console.log('Memory Usage:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
    });
  }
}

// Export performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();