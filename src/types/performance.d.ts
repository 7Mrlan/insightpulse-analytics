export {};

declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
    };
  }

  interface Navigator {
    connection?: {
      effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
      saveData?: boolean;
    };
  }
}