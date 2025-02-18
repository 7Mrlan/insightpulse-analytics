// src/apis/modules/key.api.ts
import request from '@/utils/request'; // 使用封装的 request 模块

// 获取密钥的 API 请求
export const fetchKey = (
  type: 'encryption' | 'signature',
  version: string = 'v1'
): Promise<Api.Common.KeyData> => {
  return request
    .get<Api.Common.KeyData>(`/api/keys/${type}?version=${version}`) // 修改这里，确保返回的类型是 KeyData
    .then(response => response.data);
};
