<!-- src/views/login/index.vue -->
<template>
  <div class="login-container">
    <a-card title="系统登录" style="width: 400px">
      <a-form>
        <a-form-item label="用户名">
          <a-input v-model:value="formState.username" />
        </a-form-item>
        <a-form-item label="密码">
          <a-input-password v-model:value="formState.password" />
        </a-form-item>
        <a-button type="primary" @click="handleLogin">登录</a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useAuthStore } from '@/store/auth'

const formState = reactive({
  username: '',
  password: ''
})

const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    await authStore.login(formState)
    window.location.href = '/'
  } catch (err) {
    console.error('登录失败', err)
  }
}
</script>