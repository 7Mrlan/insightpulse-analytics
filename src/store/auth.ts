// src/store/auth.ts
import { defineStore } from "pinia";
import * as api from "@/apis"; // 正确导入API模块
import { smartPreload } from "@/utils/preload";
import { CORE_ROUTES } from "@/config/preload";

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
        await smartPreload(CORE_ROUTES, {
          concurrentLoads: 2,
          memoryThreshold: 150_000_000,
        }); // 新增预加载核心路由
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
