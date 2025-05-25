// Performance monitoring utility for the extension
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = import.meta.env.DEV; // Only enable in development
  }

  // Start timing an operation
  startTimer(operation) {
    if (!this.isEnabled) return;
    
    this.metrics.set(operation, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  // End timing an operation
  endTimer(operation) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(operation);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log if operation takes longer than 100ms
      if (metric.duration > 100) {
        console.warn(`⚠️ Slow operation detected: ${operation} took ${metric.duration.toFixed(2)}ms`);
      } else {
        console.log(`✅ ${operation}: ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  // Measure memory usage
  measureMemory() {
    if (!this.isEnabled || !performance.memory) return null;
    
    const memory = {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
    
    console.log(`🧠 Memory Usage: ${memory.used}MB / ${memory.total}MB (limit: ${memory.limit}MB)`);
    
    // Warn if memory usage is high
    if (memory.used > 50) {
      console.warn(`⚠️ High memory usage: ${memory.used}MB`);
    }
    
    return memory;
  }

  // Get performance report
  getReport() {
    if (!this.isEnabled) return null;
    
    const report = {
      operations: Array.from(this.metrics.entries()).map(([name, metric]) => ({
        name,
        duration: metric.duration,
        status: metric.duration > 100 ? 'slow' : 'fast'
      })),
      memory: this.measureMemory(),
      timestamp: new Date().toISOString()
    };
    
    return report;
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
  }

  // Measure function execution time
  async measureAsync(operation, fn) {
    if (!this.isEnabled) return await fn();
    
    this.startTimer(operation);
    try {
      const result = await fn();
      this.endTimer(operation);
      return result;
    } catch (error) {
      this.endTimer(operation);
      throw error;
    }
  }

  // Measure sync function execution time
  measure(operation, fn) {
    if (!this.isEnabled) return fn();
    
    this.startTimer(operation);
    try {
      const result = fn();
      this.endTimer(operation);
      return result;
    } catch (error) {
      this.endTimer(operation);
      throw error;
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to debounce function calls
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Helper function to throttle function calls
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
} 