import { useAuthStore } from '@/store/auth';

export function checkPermission(permission: Api.Auth.Permission): boolean {
  const authStore = useAuthStore();
  return authStore.permissions.includes(permission);
}
