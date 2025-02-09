// src/utils/crud.ts
import request from './request';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

class CRUD {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(method: HttpMethod, url: string, data?: any) {
    const fullUrl = `${this.baseURL}${url}`;
    return request[method]<T>(fullUrl, method === 'get' ? { params: data } : data);
  }

  get<T>(url: string, params?: any) {
    return this.request<T>('get', url, params);
  }

  post<T>(url: string, data: any) {
    return this.request<T>('post', url, data);
  }

  put<T>(url: string, data: any) {
    return this.request<T>('put', url, data);
  }

  delete<T>(url: string, params?: any) {
    return this.request<T>('delete', url, params);
  }
}

// 示例用法：export const userCrud = new CRUD('/users')
export default CRUD;
