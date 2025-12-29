<template>
  <div class="introduction-page">
    <h1>Introduction</h1>
    <p>This is the introduction page for Band Cry.</p>
    <button @click="goBack">Back</button>
  </div>
</template>

<script setup>
const emit = defineEmits(['back']);

function goBack() {
  emit('back');
}
</script>

<style scoped>
.introduction-page {
  color: white;
  padding: 2rem;
}
</style>
