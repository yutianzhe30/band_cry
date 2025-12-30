<template>
  <div class="introduction-page">
    <h1>{{ t('introductionPage.title') }}</h1>
    <p>{{ t('introductionPage.content') }}</p>
    <button @click="goBack" class="action-button back-button">{{ t('introductionPage.back') }}</button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits(['back']);

function goBack() {
  emit('back');
}
</script>

<style scoped>
.introduction-page {
  color: white;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.action-button {
  margin-top: 2rem;
  padding: 0.8rem 1.8rem;
  font-size: 1.1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button {
  background-color: #f44336;
  color: white;
}

.back-button:hover {
  background-color: #d32f2f;
}
</style>