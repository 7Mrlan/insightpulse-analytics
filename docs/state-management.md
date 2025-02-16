---

# 状态管理与预加载模块文档

本文档详细描述了项目中与认证状态管理相关的 Pinia store 和路由预加载模块的实现。文档内容涵盖以下内容：

- **认证 Store（auth store）**  
  使用 Composition API 定义，负责管理用户的登录状态、权限以及动态路由初始化。  
- **预加载模块（PreloadManager）**  
  封装了预加载核心路由的逻辑，帮助提升页面跳转性能。  
- **集成持久化**  
  通过 Pinia 持久化插件将 `token` 字段保存到 localStorage，以便刷新页面后自动恢复状态。

---

## 目录结构示例

```
src/
 ├── store/
 │    ├── auth.ts          # 认证状态管理（auth store）
 │    └── index.ts         # 统一导出 store 模块
 ├── utils/
 │    ├── preload.ts       # 路由预加载模块
 │    └── performance.ts   # 性能监控工具（供 preload 模块使用）
 └── ...                  # 其他目录和文件
```

---

## 1. 认证状态管理模块 (`src/store/auth.ts`)

该模块使用 Pinia 的 `defineStore` 和 Composition API 方式定义，用于管理用户的认证状态，包括 token 和权限。同时支持状态持久化（仅持久化 token 字段），并提供登录、登出和初始化认证状态的方法。

### 代码示例

```ts
// src/store/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '@/apis'; // 正确导入 API 模块
import { smartPreload } from '@/utils/preload';
import { CORE_ROUTES } from '@/config/preload';
import { addDynamicRoutes } from '@/router/dynamic';
import { logError } from '@/utils/logger';

export const useAuthStore = defineStore(
  'auth',
  () => {
    // 定义状态：token 和用户权限
    const token = ref<string | null>(localStorage.getItem('token'));
    const permissions = ref<Api.Auth.Permission[]>([]);

    // 定义 getter，判断用户是否已认证
    const isAuthenticated = computed(() => !!token.value);

    /**
     * 登录操作：调用 API 获取认证信息，更新 token 与权限，
     * 同时保存 token 到 localStorage，添加动态路由，并预加载核心路由。
     */
    async function login(credentials: { username: string; password: string }) {
      try {
        const { data } = await api.login(credentials);
        token.value = data.token;
        permissions.value = data.permissions;
        localStorage.setItem('token', data.token);

        // 添加动态路由，根据用户权限扩展路由配置
        addDynamicRoutes();

        // 预加载核心路由，提高页面跳转性能
        await smartPreload(CORE_ROUTES, {
          concurrentLoads: 2,
          memoryThreshold: 150_000_000,
        });
      } catch (error) {
        logError('Login failed', error);
        throw error;
      }
    }

    /**
     * 登出操作：清除 token 与权限，并从 localStorage 中删除 token。
     */
    function logout() {
      token.value = null;
      permissions.value = [];
      localStorage.removeItem('token');
    }

    /**
     * 初始化认证状态：在应用启动时调用，
     * 从 localStorage 中恢复 token，并初始化动态路由。
     *
     * 【说明】：
     * - 当用户登录后，token 会存入 localStorage；
     * - 页面刷新后，store 中的状态会丢失，但 localStorage 中依然保存了 token；
     * - initAuth 函数从 localStorage 中读取 token 并设置到 store，
     *   同时调用 addDynamicRoutes() 确保根据登录状态初始化动态路由，
     *   使得用户刷新页面后依然处于登录状态，无需重新登录。
     */
    function initAuth() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        token.value = storedToken;
        addDynamicRoutes();
        // 如有需要，也可预加载核心路由：
        // await smartPreload(CORE_ROUTES, { concurrentLoads: 2, memoryThreshold: 150_000_000 });
      }
    }

    return {
      token,
      permissions,
      isAuthenticated,
      login,
      logout,
      initAuth,
    };
  },
  {
    // 持久化配置：使用 pinia-plugin-persistedstate
    // 这里采用官方推荐的写法，使用 pick 指定仅持久化 token 字段
    persist: {
      pick: ['token'],
    },
  }
);
```

### 说明

- **状态定义**  
  - `token` 使用 `ref` 定义，初始值从 localStorage 获取，确保页面刷新后仍保持登录状态。
  - `permissions` 用于保存用户权限信息。

- **Getter**  
  - `isAuthenticated` 用于判断用户是否已认证。

- **Actions**  
  - **login**：调用 API 后更新状态、保存 token、添加动态路由及预加载核心路由。
  - **logout**：清除状态和 localStorage 中的 token。
  - **initAuth**：在应用启动时调用，用于从 localStorage 恢复 token 并初始化动态路由。这样能保证用户刷新页面后无需重新登录，同时动态路由也能根据登录状态正确加载。

- **持久化配置**  
  使用持久化插件时，通过 `persist: { pick: ['token'] }` 仅持久化 `token` 字段。默认 storage 为 localStorage。

---

## 2. 统一导出 Store (`src/store/index.ts`)

为了便于在其他模块中统一导入和使用各个 store，可以在 `src/store/index.ts` 中统一导出各个 store 模块。

### 代码示例

```ts
// src/store/index.ts
export { useAuthStore } from './auth';
// 以后可依次添加其他 store，例如：
// export { useUserStore } from './user';
// export { useCartStore } from './cart';
```

### 说明

- **独立导出**  
  推荐采用独立导出的方式，方便按需导入。调用方只需要从 `@/store` 导入需要的 store，如：
  ```ts
  import { useAuthStore } from '@/store';
  ```
- **扩展性**  
  当项目增多 store 时，只需在此处添加导出语句，统一管理，保持代码模块化和清晰。

---

## 3. 预加载模块 (`src/utils/preload.ts`)

该模块封装了预加载核心路由的逻辑，通过 PerformanceMonitor 检查网络和内存状态，分批预加载指定的路由组件，提高页面跳转性能。

### 代码示例

```ts
// src/utils/preload.ts
import router from '@/router';
import { PRELOAD_CONFIG, CORE_ROUTES } from '@/config/preload';
import { PerformanceMonitor } from './performance';

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
  private async preloadRoute(name: RouteName, timeout: number): Promise<Api.Preload.PreloadResult> {
    const startTime = performance.now();
    try {
      const route = router.resolve({ name });
      const components = route.matched.flatMap(record =>
        Object.values(record.components ?? {})
          .filter((comp): comp is () => Promise<any> => typeof comp === 'function')
          .map(comp => comp())
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
        error: error instanceof Error ? error : new Error('Unknown error'),
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
      console.warn('[预加载] 内存不足，跳过当前批次');
      return;
    }
    try {
      await Promise.all(
        routes.map(route =>
          this.preloadRoute(route, options.timeout ?? this.config.TIMEOUT)
        )
      );
    } catch (error) {
      console.error('[预加载] 预加载失败', error);
    }
  }

  /**
   * 智能预加载，整个预加载流程的入口
   * @param routes 需要预加载的路由
   * @param options 预加载选项
   */
  async smartPreload(routes: RouteName[], options: Api.Preload.PreloadOptions = {}): Promise<void> {
    if (!this.monitor.checkNetwork()) {
      console.log('[预加载] 网络状况不佳，跳过预加载');
      return;
    }

    const sortedRoutes = routes
      .filter(route => this.config.routePreloadConfig[route])
      .sort((a, b) =>
        this.config.routePreloadConfig[a].priority - this.config.routePreloadConfig[b].priority
      );

    const chunks: RouteName[][] = [];
    const size = options.concurrentLoads ?? this.config.CONCURRENT_LOADS;
    for (let i = 0; i < sortedRoutes.length; i += size) {
      chunks.push(sortedRoutes.slice(i, i + size));
    }

    for (const chunk of chunks) {
      try {
        await this.preloadChunk(chunk, options);
      } catch (error) {
        console.error('[预加载] 批次预加载失败', error);
      }
    }
  }
}

export const preloadManager = new PreloadManager();
export const smartPreload = preloadManager.smartPreload.bind(preloadManager);
```

### 说明

- **性能监控**  
  使用 `PerformanceMonitor` 来检查内存与网络状况，确保在网络或内存不足时跳过预加载，避免卡顿。
  
- **预加载流程**  
  - `preloadRoute`: 针对单个路由进行预加载（通过调用异步加载函数）。
  - `preloadChunk`: 将路由分批预加载，防止一次性加载过多导致性能问题。
  - `smartPreload`: 作为整个预加载流程的入口，根据配置排序路由并分批调用 `preloadChunk`。

---

## 4. 总结

通过上述模块化的设计，项目状态管理和预加载功能得到清晰划分：

- **Auth Store (`auth.ts`)**  
  使用 Composition API 编写，管理 token 与权限，并支持登录、登出、初始化认证状态。持久化配置采用插件方式，仅保存 `token` 字段。  
  - **initAuth** 的作用在于恢复页面刷新时的登录状态，并初始化动态路由，确保用户体验一致。

- **统一导出 (`store/index.ts`)**  
  通过独立导出各个 store 模块，方便在项目其他部分按需导入和使用。

- **预加载模块 (`preload.ts`)**  
  封装预加载逻辑，结合性能监控、批量加载、超时控制等措施，提升页面跳转性能。

采用这种结构化、模块化的方式，有助于保持代码清晰、可维护，同时便于扩展和重用。如果项目中状态管理或预加载逻辑变得复杂，可进一步拆分或抽取共用逻辑到单独的 composable 或 service 层。

---
