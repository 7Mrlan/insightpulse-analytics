declare namespace Api.Preload {
  type NetworkType = 'slow-2g' | '2g' | '3g' | '4g';
  
  interface PreloadConfig {
    priority: number;
    timeout?: number;
    condition?: () => boolean;
    chunks?: string[];
  }

  interface PreloadOptions {
    concurrentLoads?: number;
    memoryThreshold?: number;
    networkConditions?: NetworkType[];
    timeout?: number;
  }

  interface PreloadResult {
    success: boolean;
    error?: Error;
    duration?: number;
  }
}