import router from "@/router";
import { PRELOAD_CONFIG, CORE_ROUTES } from "@/config/preload";
import { PerformanceMonitor } from "./performance";

// 直接使用 `CORE_ROUTES`，避免 TS 报错
type RouteName = (typeof CORE_ROUTES)[number];

class PreloadManager {
  private monitor: PerformanceMonitor;
  private config = PRELOAD_CONFIG;

  constructor() {
    this.monitor = new PerformanceMonitor(this.config.MEMORY_THRESHOLD);
  }

  /**
   * 预加载指定路由
   * @param name 路由名称
   * @param timeout 超时时间
   */
  private async preloadRoute(
    name: RouteName,
    timeout: number
  ): Promise<Api.Preload.PreloadResult> {
    const startTime = performance.now();

    try {
      const route = router.resolve({ name });
      const components = route.matched.flatMap((record) =>
        Object.values(record.components ?? {})
          .filter(
            (comp): comp is () => Promise<any> => typeof comp === "function"
          )
          .map((comp) => comp())
      );

      await Promise.race([
        Promise.all(components),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout: ${name}`)), timeout)
        ),
      ]);

      return { success: true, duration: performance.now() - startTime };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
        duration: performance.now() - startTime,
      };
    }
  }

  /**
   * 批量预加载多个路由
   * @param routes 路由名称数组
   * @param options 预加载选项
   */
  private async preloadChunk(
    routes: RouteName[],
    options: Api.Preload.PreloadOptions
  ): Promise<void> {
    if (!this.monitor.checkMemory()) {
      console.warn("[预加载] 内存不足，跳过当前批次");
      return;
    }

    try {
      await Promise.all(
        routes.map((route) =>
          this.preloadRoute(route, options.timeout ?? this.config.TIMEOUT)
        )
      );
    } catch (error) {
      console.error(`[预加载] 预加载失败`, error);
    }
  }

  /**
   * 智能预加载
   * @param routes 需要预加载的路由
   * @param options 预加载选项
   */
  async smartPreload(
    routes: RouteName[],
    options: Api.Preload.PreloadOptions = {}
  ): Promise<void> {
    if (!this.monitor.checkNetwork()) {
      console.log("[预加载] 网络状况不佳，跳过预加载");
      return;
    }

    const sortedRoutes = routes
      .filter((route) => this.config.routePreloadConfig[route])
      .sort(
        (a, b) =>
          this.config.routePreloadConfig[a].priority -
          this.config.routePreloadConfig[b].priority
      );

    const chunks: RouteName[][] = [];
    const size = options.concurrentLoads ?? this.config.CONCURRENT_LOADS;

    for (let i = 0; i < sortedRoutes.length; i += size) {
      chunks.push(sortedRoutes.slice(i, i + size));
    }

    for (const chunk of chunks) {
      try {
        await Promise.all(
          chunk.map((route) => this.preloadChunk([route], options))
        );
      } catch (error) {
        console.error(`[预加载] 批次预加载失败`, error);
      }
    }
  }
}

export const preloadManager = new PreloadManager();
export const smartPreload = preloadManager.smartPreload.bind(preloadManager);
