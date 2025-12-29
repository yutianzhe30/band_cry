<template>
  <div class="introduction-page">
    <h1>{{ t('introductionPage.title') }}</h1>
    <p>{{ t('introductionPage.content') }}</p>
    <button @click="goBack">{{ t('introductionPage.back') }}</button>
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
}
</style>
