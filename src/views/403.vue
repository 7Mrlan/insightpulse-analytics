<!-- src/views/403.vue -->
<template>
  <div class="forbidden">
    <h1>403</h1>
    <p>Sorry, you don't have permission to access this page.</p>
    <a-button type="primary" @click="$router.push('/')">Back to Home</a-button>
  </div>
</template>