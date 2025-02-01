// router/guard.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { checkPermission } from "@/utils/auth";

/**
 * 设置路由守卫
 */
export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    // **优化 1：修复 `meta.permission` 校验**
    if (to.meta.permission && typeof to.meta.permission !== "string") {
      console.warn(`路由 ${to.fullPath} 的 permission 配置错误`);
      return false; // 直接阻止错误的路由
    }

    // **优化 2：确保 authStore 已初始化**
    if (!authStore) {
      console.warn("`authStore` 未初始化，可能导致身份验证错误");
      return false;
    }

    // **优化 3：身份验证检查（需要登录）**
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: "Login", query: { redirect: to.fullPath } };
    }

    // **优化 4：检查权限**
    if (to.meta.permission) {
      if (!authStore.permissions) {
        console.warn("权限检查失败，authStore 未初始化");
        return false;
      }
      if (!checkPermission(to.meta.permission as Api.Auth.Permission)) {
        return { name: "403" };
      }
    }

    return true; // 允许跳转
  });
}
