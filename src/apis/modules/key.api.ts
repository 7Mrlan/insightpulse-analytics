// src/apis/modules/key.api.ts
import request from '@/utils/request'; // 使用封装的 request 模块

// 获取密钥的 API 请求
export const fetchKey = (type: 'encryption' | 'signature', version: string = 'v1') => {
  return request
    .get<string>(`/api/keys/${type}?version=${version}`)
    .then(response => response.data);
};
