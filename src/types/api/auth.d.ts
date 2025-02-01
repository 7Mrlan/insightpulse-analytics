// src/types/api/auth.d.ts
declare namespace Api.Auth {
  type Permission =
    | "dashboard:view"
    | "report:generate"
    | "alert:config"
    | "user:manage";

  interface LoginRes {
    token: string;
    permissions: Permission[];
  }
}
