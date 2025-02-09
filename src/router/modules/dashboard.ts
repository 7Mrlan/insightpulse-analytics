// router/modules/dashboard.ts
import type { RouteRecordRaw } from 'vue-router';

const dashboardRoute: RouteRecordRaw = {
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/views/dashboard/index.vue'),
  meta: {
    requiresAuth: true,
    permission: 'dashboard:view',
    title: '舆情概览',
    preloadPriority: 1, // 用于预加载优化
  },
};

export default dashboardRoute;
