// router/routes.ts
import type { RouteRecordRaw } from "vue-router";
import BasicLayout from "@/layouts/BasicLayout.vue";

export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    component: BasicLayout,
    redirect: "/dashboard",
    children: [
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: {
          requiresAuth: true,
          permission: "dashboard:view",
          title: "舆情概览",
        },
      },
    ],
  },
];
