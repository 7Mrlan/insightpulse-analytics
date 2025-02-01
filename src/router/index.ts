// router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { dynamicRoutes } from "./routes";
import { setupRouterGuard } from "./guard";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/login/index.vue"),
      meta: { requiresAuth: false }
    },
    {
      path: "/403",
      name: "403",
      component: () => import("@/views/403.vue"),
      meta: { requiresAuth: false }
    },
    ...dynamicRoutes,
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
  ],
});

// 安装路由守卫
setupRouterGuard(router);

export default router;
