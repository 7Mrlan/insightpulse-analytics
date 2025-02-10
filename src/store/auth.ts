// src/store/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '@/apis'; // 正确导入 API 模块
import { smartPreload } from '@/utils/preload';
import { CORE_ROUTES } from '@/config/preload';
import { addDynamicRoutes } from '@/router/dynamic';
import { logError } from '@/utils/logger';

export const useAuthStore = defineStore(
  'auth',
  () => {
    // 定义状态
    const token = ref<string | null>(localStorage.getItem('token'));
    const permissions = ref<Api.Auth.Permission[]>([]);

    // 定义 getter
    const isAuthenticated = computed(() => !!token.value);

    // 定义 actions

    /**
     * 登录操作：调用 API 获取认证信息，更新 token 与权限，
     * 同时保存 token 到 localStorage，添加动态路由，并预加载核心路由。
     */
    async function login(credentials: { username: string; password: string }) {
      try {
        const { data } = await api.login(credentials);
        token.value = data.token;
        permissions.value = data.permissions;
        localStorage.setItem('token', data.token);

        // 添加动态路由，根据权限扩展路由配置
        addDynamicRoutes();

        // 预加载核心路由，提高页面跳转性能
        await smartPreload(CORE_ROUTES, {
          concurrentLoads: 2,
          memoryThreshold: 150_000_000,
        });
      } catch (error) {
        logError('Login failed', error);
        throw error;
      }
    }

    /**
     * 登出操作：清除 token 与权限，并从 localStorage 中删除 token。
     */
    function logout() {
      token.value = null;
      permissions.value = [];
      localStorage.removeItem('token');
    }

    /**
     * 初始化认证状态：在应用启动时调用，
     * 从 localStorage 中恢复 token，并初始化动态路由。
     */
    function initAuth() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        token.value = storedToken;
        addDynamicRoutes();
        // 可根据需要再调用 smartPreload 预加载核心路由，提高首屏加载速度
        // await smartPreload(CORE_ROUTES, { concurrentLoads: 2, memoryThreshold: 150_000_000 });
      }
    }

    return {
      token,
      permissions,
      isAuthenticated,
      login,
      logout,
      initAuth,
    };
  },
  {
    // 持久化配置：仅持久化 token 字段
    persist: {
      pick: ['token'],
    },
  }
);
