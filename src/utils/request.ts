// utils/request.ts
import axios, { type AxiosResponse, type AxiosError } from "axios";
import { useAuthStore } from "@/store/auth";
import { message } from "ant-design-vue";

// 创建可扩展的axios实例
const createService = () => {
  const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || "/api",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  // 请求拦截器
  service.interceptors.request.use((config) => {
    const authStore = useAuthStore();

    // 自动添加Token
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    // 统一添加版本号
    config.headers["X-API-Version"] = "v1";

    return config;
  });

  // 响应拦截器
  service.interceptors.response.use(
    (response) => handleResponse(response),
    (error) => handleError(error)
  );

  return service;
};

// 统一处理响应
const handleResponse = (response: AxiosResponse) => {
  const res = response.data as Api.Common.Response;

  // 业务逻辑错误处理
  if (res.code !== 200) {
    return Promise.reject(new Error(res.message || "Business Error"));
  }

  // 返回有效载荷数据
  return res.data;
};

// 统一错误处理
const handleError = (error: AxiosError) => {
  const status = error.response?.status;

  // 401处理
  if (status === 401) {
    const authStore = useAuthStore();
    authStore.logout();
    window.location.replace(
      `/login?redirect=${encodeURIComponent(window.location.pathname)}`
    );
    return Promise.reject(new Error("会话已过期，请重新登录"));
  }

  // 超时处理
  if (error.code === "ECONNABORTED") {
    return Promise.reject(new Error("请求超时，请检查网络"));
  }

  // 其他错误
  message.error(error.message || "Request failed");
  return Promise.reject(error);
};

const service = createService();
export default service;
