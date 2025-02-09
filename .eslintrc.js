module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  // 继承 Vue 和 TypeScript 的标准规则，同时整合 Prettier
  extends: [
    "plugin:vue/vue3-recommended",
    "@vue/standard",
    "@vue/typescript/recommended",
    "plugin:prettier/recommended", // 确保 Prettier 放在最后
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    // 可根据项目需要自定义规则，例如：
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    // 可根据实际情况添加、修改或关闭部分规则
    "vue/multi-word-component-names": "off",
  },
  overrides: [
    {
      files: ["*.vue"],
      rules: {
        // 对 Vue 单文件组件可定制化规则
      },
    },
  ],
};
