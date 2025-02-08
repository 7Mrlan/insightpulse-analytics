// router/routes.ts
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
      // more dynamic routes
    ],
  },
];
