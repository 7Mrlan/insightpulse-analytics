// utils/request.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth";
import type { Api } from "@/types/api";

// 创建实例
const service = axios.create({
  baseURL: '/api', // Change to use proxy
  timeout: 10000,  // Reduce timeout to 10s
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器
service.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data as Api.Response<any>;

    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || "Error"));
    }
    return res.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token失效处理
      const authStore = useAuthStore();
      authStore.logout();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default service;
