// src/store/auth.ts
import { defineStore } from 'pinia';
import * as api from '@/apis'; // 正确导入 API 模块
import { smartPreload } from '@/utils/preload';
import { CORE_ROUTES } from '@/config/preload';
import { addDynamicRoutes } from '@/router/dynamic';
import { logError } from '@/utils/logger';

interface AuthState {
  token: string | null;
  permissions: Api.Auth.Permission[];
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    // 初始 token 从 localStorage 获取，保证页面刷新后仍保持登录状态
    token: localStorage.getItem('token'),
    permissions: [],
  }),
  getters: {
    isAuthenticated: state => !!state.token,
  },
  actions: {
    /**
     * 登录操作：调用 API 获取认证信息，并更新状态与本地存储。
     * 登录后，添加动态路由和预加载核心路由。
     */
    async login(credentials: { username: string; password: string }) {
      try {
        // 调用登录 API
        const { data } = await api.login(credentials);
        // 先更新 token 和权限，确保动态路由和预加载依赖最新认证信息
        this.token = data.token;
        this.permissions = data.permissions;
        localStorage.setItem('token', data.token);

        // 添加动态路由（根据权限配置动态扩展路由）
        addDynamicRoutes();

        // 预加载核心路由，提高后续页面跳转性能
        await smartPreload(CORE_ROUTES, {
          concurrentLoads: 2,
          memoryThreshold: 150_000_000,
        });
      } catch (error) {
        logError('', error);
        throw error;
      }
    },

    /**
     * 登出操作：清除认证状态和本地存储中的 token。
     */
    logout() {
      this.token = null;
      this.permissions = [];
      localStorage.removeItem('token');
      // 可选：重置动态路由（如果需要还原为未登录状态的路由）
    },

    /**
     * 初始化认证状态：在应用启动时调用，
     * 从 localStorage 恢复 token，并初始化动态路由（以及预加载核心路由）。
     */
    initAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        // 如有必要，可调用 API 获取用户权限并更新 state
        // 此处直接添加动态路由，保证页面刷新后保持动态路由配置
        addDynamicRoutes();

        // 可选：预加载核心路由，提升首屏性能
        // await smartPreload(CORE_ROUTES, { concurrentLoads: 2, memoryThreshold: 150_000_000 });
      }
    },
  },
});
