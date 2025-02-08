
---

# 企业级路由管理文档

**版本：1.0**  
**发布日期：2025-02-07**  
**适用项目：基于 Vue 3 + Vue Router + Pinia 的前端应用**

---

## 1. 概述

本项目采用 Vue Router 进行前端路由管理，结合动态路由注册、全局守卫、权限校验及预加载优化等机制，构建安全、高效、易扩展的路由架构。该文档主要介绍以下内容：

- 项目路由整体架构与模块划分  
- 各关键路由模块及文件的详细说明  
- 动态路由注册及权限控制的实现方案  
- 路由扩展与新增路由的最佳实践  
- 统一日志记录与错误处理策略

---

## 2. 路由架构总览

项目路由体系分为两大部分：

### 2.1 静态路由
- **用途**：主要用于未登录时访问的页面及错误提示页面，如登录页 (`/login`)、403 页面 (`/403`) 和通配符重定向（未匹配路由时自动跳转）。
- **加载时机**：应用启动时即注册，确保在任何情况下均能快速响应。

### 2.2 动态路由
- **用途**：包括企业核心功能页面，如仪表盘（Dashboard）等，需要根据用户权限动态加载。
- **加载时机**：在用户登录成功后，根据权限动态注册到路由实例中，避免未授权访问，同时降低首次加载压力。
- **模块化管理**：动态路由按业务模块拆分在独立文件中管理，便于团队协作和后续扩展。

---

## 3. 路由模块及文件说明

### 3.1 路由实例入口 —— `router/index.ts`
- **功能**：创建 Vue Router 实例，并注册所有静态路由。
- **关键点**：
  - 使用 `createWebHistory` 实现 HTML5 路由模式。
  - 初始路由只包含静态路由（如登录、403 页面、404 重定向）。
  - 全局安装路由守卫（`setupRouterGuard`）。

**示例代码**：
```ts
import { createRouter, createWebHistory } from "vue-router";
import { setupRouterGuard } from "./guard";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/login/index.vue"),
      meta: { requiresAuth: false, title: "用户登录" },
    },
    {
      path: "/403",
      name: "403",
      component: () => import("@/views/403.vue"),
      meta: { requiresAuth: false, title: "403" },
    },
    // 通配符：未匹配的路径重定向到 /dashboard
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
  ],
});

// 安装路由守卫
setupRouterGuard(router);

export default router;
```

### 3.2 路由守卫 —— `router/guard.ts`
- **功能**：全局守卫主要负责身份验证、权限校验、错误提示等。
- **关键点**：
  - **身份验证**：检测目标路由是否需要登录（`meta.requiresAuth`），若未登录则重定向到登录页。
  - **权限校验**：支持 `meta.permission` 配置为字符串或字符串数组，采用【任一满足】的策略（具体策略可根据业务需求调整）。
  - **错误日志**：调用统一日志记录模块 `logger.ts` 记录异常信息，便于后期问题追踪。

**示例代码**：
```ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { checkPermission } from "@/utils/auth";
import { logError } from "@/utils/logger";

/**
 * 校验权限函数
 */
function hasPermission(requiredPermission: string | string[]): boolean {
  const authStore = useAuthStore();
  if (!authStore.permissions) return false; // 确保权限数据已加载
  return Array.isArray(requiredPermission)
    ? requiredPermission.every((p) => checkPermission(p))
    : checkPermission(requiredPermission);
}

/**
 * 设置路由守卫
 */
export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    // **统一校验 meta.permission**
    const { permission, requiresAuth } = to.meta;
    if (
      permission &&
      !(typeof permission === "string" || Array.isArray(permission))
    ) {
      logError(
        `路由 ${to.fullPath} 的 permission 配置错误，需为 string 或 string[]`
      );
      return false;
    }

    // **需要登录的页面，检查用户身份**
    if (requiresAuth && !authStore.isAuthenticated) {
      return { name: "Login", query: { redirect: to.fullPath } };
    }

    // **检查权限**
    if (permission && !hasPermission(permission as string | string[])) {
      return { name: "403" };
    }

    return true;
  });
}

```

### 3.3 统一日志记录模块 —— `src/utils/logger.ts`
- **功能**：集中处理错误与警告信息，方便后期扩展（如上报后台日志）。
- **关键点**：  
  - 提供 `logError` 与 `logWarn` 两个函数，统一日志格式。

**示例代码**：
```ts
export function logError(message: string, error?: any) {
  console.error(`[Error] ${message}`, error);
}

export function logWarn(message: string) {
  console.warn(`[Warn] ${message}`);
}
```

### 3.4 模块化动态路由管理

#### 3.4.1 单个模块路由 —— `router/modules/dashboard.ts`
- **功能**：管理与仪表盘（Dashboard）相关的路由配置。
- **关键点**：
  - 定义路由路径、名称、组件加载方式（懒加载）、以及路由元数据（包括权限、页面标题、预加载优先级）。
  
**示例代码**：
```ts
import type { RouteRecordRaw } from "vue-router";

const dashboardRoute: RouteRecordRaw = {
  path: "/dashboard",
  name: "Dashboard",
  component: () => import("@/views/dashboard/index.vue"),
  meta: {
    requiresAuth: true,
    permission: "dashboard:view",
    title: "舆情概览",
    preloadPriority: 1,
  },
};

export default dashboardRoute;
```

#### 3.4.2 动态路由主入口 —— `router/routes.ts`
- **功能**：按模块合并所有动态路由，并嵌入主布局（BasicLayout）。
- **关键点**：
  - 使用 `BasicLayout` 作为父组件，所有动态路由均在其 `children` 内配置。
  - 后续新增模块时，只需在此文件中合并对应模块的路由配置。

**示例代码**：
```ts
import type { RouteRecordRaw } from "vue-router";
import BasicLayout from "@/layouts/BasicLayout.vue";
import dashboardRoute from "./modules/dashboard";

export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    component: BasicLayout,
    redirect: "/dashboard",
    children: [
      dashboardRoute,
      // 后续可在此添加其他模块路由，如 userRoute、reportRoute 等
    ],
  },
];
```

### 3.5 动态路由注册 —— `router/dynamic.ts`
- **功能**：提供统一接口，在用户登录后根据权限动态注册路由。
- **关键点**：
  - 调用 `router.addRoute()` 方法批量添加动态路由。
  - 可根据用户权限过滤路由（如有需求，可在此扩展）。

**示例代码**：
```ts
import router from "./index";
import type { RouteRecordRaw } from "vue-router";
import { dynamicRoutes } from "./routes";

/**
 * 根据用户权限动态添加路由
 * 如需过滤权限，可在此处对 dynamicRoutes 进行过滤后再添加
 */
export function addDynamicRoutes(routes: RouteRecordRaw[] = dynamicRoutes) {
  routes.forEach((route) => {
    router.addRoute(route);
  });
}
```

### 3.6 鉴权登录与动态路由添加 —— `src/store/auth.ts`
- **功能**：在用户登录成功后，调用动态路由注册接口，将用户可访问的路由添加到路由实例中。
- **关键点**：
  - 登录成功后，先调用 `addDynamicRoutes()`，再更新用户 token 与权限信息。
  - 如有需要，预加载逻辑也可在此处启动。

**示例代码**：
```ts
import { defineStore } from "pinia";
import * as api from "@/apis";
import { smartPreload } from "@/utils/preload";
import { addDynamicRoutes } from "@/router/dynamic";

interface AuthState {
  token: string | null;
  permissions: Api.Auth.Permission[];
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("token"),
    permissions: [],
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials: { username: string; password: string }) {
      try {
        const { data } = await api.login(credentials);

        // 动态添加用户可访问的路由
        addDynamicRoutes();

        // 如需预加载，请根据业务需要开启（目前预加载可选）
        // await smartPreload(CORE_ROUTES, {
        //   concurrentLoads: 2,
        //   memoryThreshold: 150_000_000,
        // });

        this.token = data.token;
        this.permissions = data.permissions;
        localStorage.setItem("token", data.token);
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.permissions = [];
      localStorage.removeItem("token");
    },
  },
});
```

---

## 4. 路由开发最佳实践

### 4.1 新增/扩展路由
- **懒加载组件**：采用箭头函数异步加载组件，降低首屏加载压力。
- **规范 meta 信息**：
  - `requiresAuth`：标记页面是否需要用户登录。
  - `permission`：设置页面访问所需权限，支持字符串或数组（建议使用权限标识，如 `dashboard:view`）。
  - `title`：页面标题，用于动态设置浏览器标签页标题及菜单显示。
  - `preloadPriority`：预加载优先级，供预加载模块判断加载顺序（数值越小优先级越高）。
- **模块化管理**：将路由按业务模块拆分，新增模块时在 `router/modules` 下创建对应文件，然后在 `router/routes.ts` 中引入并合并。

### 4.2 动态路由与权限控制
- **动态添加路由**：确保初始路由仅包含静态页面，在用户登录后，根据权限调用 `addDynamicRoutes()` 动态注册路由，防止未授权用户访问。
- **权限校验**：在路由守卫中统一校验 `meta.permission`，支持数组和单一字符串。若配置错误，及时记录日志并阻止路由访问。

### 4.3 日志与错误处理
- 使用 `src/utils/logger.ts` 统一记录错误和警告，便于后期问题追踪与上报。
- 路由守卫、动态路由添加和鉴权流程中均需注意日志记录，保证出现问题时能迅速定位。

### 4.4 动态路由扩展（可选）
- 如有需求，可根据用户权限动态过滤路由，只将用户有权限访问的页面添加到路由实例中。
- 动态路由注册逻辑可进一步封装，在登录后通过调用后端接口获取可访问的路由列表，再利用 `router.addRoute()` 动态添加。

---

## 5. 后续维护与扩展建议

- **模块化分层**：保持路由配置的模块化结构，尽量将业务相关的路由拆分到独立模块，便于团队协作和后续维护。
- **日志系统升级**：根据项目规模，可以将日志系统扩展为上报后端日志，集中管理错误信息。
- **权限管理策略**：定期评审并完善权限校验逻辑，必要时扩展为更复杂的 RBAC（基于角色的权限控制）方案。
- **预加载优化**：结合业务场景，动态路由与预加载策略可进一步优化，提升用户体验。

---

## 6. 总结

本路由架构通过静态路由与动态路由相结合，配合全局守卫和统一日志管理，实现了安全、灵活、易扩展的前端路由系统。开发人员在新增或修改路由时，务必遵循以下原则：

- 使用懒加载和模块化管理，确保代码整洁和性能优化。
- 严格按照规范配置路由元数据，确保身份验证、权限校验和预加载逻辑正常工作。
- 动态路由注册需在用户登录后进行，防止未授权访问。
- 统一错误日志记录，方便后期维护和问题排查。

请各位开发人员参照本文档，确保项目路由管理的一致性和高质量实现。

---

**附录**：  
- 如需进一步讨论或修改，请及时联系技术负责人或相关模块维护人员。  
- 本文档将随项目迭代更新，请注意版本控制和文档归档管理。

---

以上即为企业级路由文档。希望此文档能为后续开发提供清晰指导，并帮助团队构建一个高效、稳定的前端路由系统。