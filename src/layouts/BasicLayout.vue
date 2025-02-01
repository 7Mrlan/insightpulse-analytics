<!-- src/layouts/BasicLayout.vue -->
<template>
  <a-layout>
    <a-layout-header>InsightPulse 舆情分析系统</a-layout-header>
    <a-layout>
      <a-layout-sider>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          :items="menuItems"
          @click="handleMenuClick"
        />
      </a-layout-sider>
      <a-layout-content>
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedKeys = ref<string[]>(['1'])

const menuItems = [
  { key: '1', label: '舆情概览', path: '/dashboard' },
  { key: '2', label: '报告管理', path: '/reports' }
]

const handleMenuClick = ({ item }: { item: any }) => {
  router.push(item.props.path)
}
</script>