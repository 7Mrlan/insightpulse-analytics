export default {
  // 设置 base 为 "/docs/"，表示文档内的链接都以 "/docs/" 为根
  base: "/docs/",
  title: "企业级项目文档",
  description: "前端项目文档，包含路由、状态管理、API 等",
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "路由", link: "/routing" },
      { text: "状态管理", link: "/state-management" },
      { text: "API 文档", link: "/api" },
    ],
    sidebar: [
      {
        text: "基础文档",
        items: [
          { text: "企业级路由文档", link: "/routing" },
          { text: "状态管理", link: "/state-management" },
          { text: "API 文档", link: "/api" },
        ],
      },
    ],
  },
};
