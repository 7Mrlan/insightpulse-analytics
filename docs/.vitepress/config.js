// docs/.vitepress/config.js
 export default {
   base: "/insightpulse-analytics/docs/",// 添加这一行，仓库名作为 base
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
