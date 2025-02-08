// router/guard.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { checkPermission } from "@/utils/auth";
import { logError } from "@/utils/logger";

/**
 * 校验权限函数
 */
/**
 * 校验权限函数
 */
function hasPermission(
  requiredPermission: Api.Auth.Permission | Api.Auth.Permission[]
): boolean {
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
    if (
      permission &&
      !hasPermission(permission as Api.Auth.Permission | Api.Auth.Permission[])
    ) {
      return { name: "403" };
    }

    return true;
  });
}
