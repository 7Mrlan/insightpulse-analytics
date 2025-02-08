export const PRELOAD_CONFIG = {
  MEMORY_THRESHOLD: 100_000_000, // 100MB
  TIMEOUT: 5000, // Preload timeout in ms
  CONCURRENT_LOADS: 3, // Maximum concurrent preloads
  routePreloadConfig: {
    Dashboard: {
      priority: 1,
      timeout: 3000,
    },
    ReportList: {
      priority: 2,
      timeout: 5000,
    },
  },
};

export const CORE_ROUTES = Object.keys(
  PRELOAD_CONFIG.routePreloadConfig
) as (keyof typeof PRELOAD_CONFIG.routePreloadConfig)[];
