// types/api.d.ts
export declare namespace Api {
  // 基础响应结构
  interface Response<T> {
    code: number;
    data: T;
    message?: string;
  }

  // 用户权限类型
  type Permission = "dashboard:view" | "report:generate" | "alert:config" | "user:manage";

  // 登录响应
  interface LoginRes {
    token: string;
    permissions: Permission[];
  }
}
