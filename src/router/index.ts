// router/index.ts

// 保证在未登录状态下只加载静态路由，提高安全性

// 动态路由将在用户登录后根据权限动态添加

import { createRouter, createWebHistory } from 'vue-router';
import { setupRouterGuard } from './guard';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { requiresAuth: false, title: '用户登录' },
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/views/403.vue'),
      meta: { requiresAuth: false, title: '403' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
});

// 安装路由守卫
setupRouterGuard(router);

export default router;
