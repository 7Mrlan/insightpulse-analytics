// src/store/auth.ts
import { defineStore } from "pinia";
import type { Api } from "@/types/api";
import * as api from '@/apis'  // 正确导入API模块

interface AuthState {
  token: string | null;
  permissions: Api.Permission[];
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
        this.token = data.token;
        this.permissions = data.permissions;
        localStorage.setItem("token", data.token);
      } catch (error) {
        console.error('Login failed:', error);
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
