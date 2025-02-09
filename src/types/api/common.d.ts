// src/types/api/common.d.ts
declare namespace Api.Common {
  /** 基础响应结构 */
  interface Response<T = any> {
    code: number;
    data: T;
    message?: string;
  }

  /** 分页参数（可选）*/
  interface Pagination {
    page?: number;
    pageSize?: number;
  }
}
