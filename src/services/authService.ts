import * as api from '@/apis';

/**
 * 登录 API
 * @param credentials 用户名和密码
 * @returns 登录响应数据
 */
export async function loginService(credentials: { username: string; password: string }) {
  const { data } = await api.login({ ...credentials });
  return data;
}
