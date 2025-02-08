export default {
  // 设置 base 为 "/insightpulse-analytics/docs/"，这样生成的文档链接都会以该路径为前缀
  base: "/insightpulse-analytics/docs/",
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
      // 你可以继续添加其他分组或模块
    ],
  },
};
