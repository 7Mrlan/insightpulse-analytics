import type { Api } from "@/types/api";
import { useAuthStore } from "@/store/auth";

export function checkPermission(permission: Api.Permission): boolean {
  const authStore = useAuthStore();
  return authStore.permissions.includes(permission);
}
