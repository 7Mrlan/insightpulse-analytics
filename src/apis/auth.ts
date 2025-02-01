// src/apis/auth.ts
import request from "@/utils/request";
import type { Api } from "@/types/api";
import { http, HttpResponse } from 'msw'

export const login = (data: { username: string; password: string }) => {
  return request.post<Api.LoginRes>("/api/login", data);
};

export const handlers = [
  http.post('/api/login', async () => {
    return HttpResponse.json({
      code: 200,
      data: {
        token: 'mock-token',
        permissions: ['dashboard:view']
      }
    }, { status: 200 })
  })
];
