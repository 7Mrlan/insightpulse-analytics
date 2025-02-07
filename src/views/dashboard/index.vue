<!-- src/views/dashboard/index.vue -->
<template>
  <div class="dashboard">
    <h1>舆情数据概览</h1>
    <a-empty description="数据加载中..." />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'Dashboard', // This name matches cachedRoutes for caching
})
</script>
