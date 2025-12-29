<template>
  <div class="settings-page">
    <h1>Settings</h1>
    <p>This is the settings page for Band Cry.</p>
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
.settings-page {
  color: white;
  padding: 2rem;
}
</style>
