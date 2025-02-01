// src/types/shims.d.ts
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 合并所有API类型
declare namespace Api {
  export import Common = Api.Common;
  export import Auth = Api.Auth;
}

declare module "@/*" {
  // 保持空声明即可，用于通过类型检查
}
