<!-- App.vue -->
<
<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedRoutes">
        <component :is="Component" :key="$route.fullPath" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Routes that should be cached
const cachedRoutes = ref([
  'Dashboard',
  // Add other route names that need caching
]);
</script>

<style>
#app {
  height: 100vh;
}
</style>
