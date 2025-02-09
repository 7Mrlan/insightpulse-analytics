// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';

// 初始化应用
const app = createApp(App);

// 安装核心插件
app.use(createPinia());
app.use(router);
app.use(Antd);

// 挂载到DOM
app.mount('#app');
