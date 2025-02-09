// router/dynamic.ts
import router from './index';
import type { RouteRecordRaw } from 'vue-router';
import { dynamicRoutes } from './routes';

/**
 * 根据用户权限动态添加路由
 * 如果需要根据权限过滤，请在此处处理过滤逻辑后再添加路由
 */
export function addDynamicRoutes(routes: RouteRecordRaw[] = dynamicRoutes) {
  routes.forEach(route => {
    router.addRoute(route);
  });
}
