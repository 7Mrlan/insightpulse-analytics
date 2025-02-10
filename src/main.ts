// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import persistedState from 'pinia-plugin-persistedstate';
import router from './router';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import { useAuthStore } from '@/store/auth';

// 初始化应用
const app = createApp(App);
const pinia = createPinia();

// 安装持久化插件
pinia.use(persistedState);

// 安装核心插件
app.use(pinia);
app.use(router);
app.use(Antd);

// 用户刷新页面时，从 localStorage 恢复认证状态
const authStore = useAuthStore();
authStore.initAuth();

// 挂载到DOM
app.mount('#app');
