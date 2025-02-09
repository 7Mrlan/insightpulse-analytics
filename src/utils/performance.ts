export class PerformanceMonitor {
  private memoryThreshold: number;

  constructor(memoryThreshold: number) {
    this.memoryThreshold = memoryThreshold;
  }

  checkMemory(): boolean {
    if (!performance.memory) return true;

    const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
    return jsHeapSizeLimit - usedJSHeapSize >= this.memoryThreshold;
  }

  checkNetwork(): boolean {
    const connection = navigator.connection;
    if (!connection) return true;

    return connection.effectiveType !== 'slow-2g' && !connection.saveData;
  }
}
