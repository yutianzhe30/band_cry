<template>
  <div class="settings-page">
    <h1>{{ t('settingsPage.title') }}</h1>
    <p>{{ t('settingsPage.content') }}</p>

    <div class="language-switcher">
      <h2>{{ t('settingsPage.language') }}</h2>
      <div class="options">
        <button @click="switchLanguage('en')" :class="{ active: locale === 'en' }">English</button>
        <button @click="switchLanguage('zh')" :class="{ active: locale === 'zh' }">中文</button>
      </div>
    </div>

    <button class="back-button" @click="goBack">{{ t('settingsPage.back') }}</button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const emit = defineEmits(['back']);

function goBack() {
  emit('back');
}

function switchLanguage(lang) {
  locale.value = lang;
}
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  padding: 2rem;
  text-align: center;
}

.language-switcher {
  margin: 2rem 0;
}

.options {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.options button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 2px solid #4CAF50;
  background-color: transparent;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.options button:hover,
.options button.active {
  background-color: #4CAF50;
}

.back-button {
  margin-top: 2rem;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  background-color: #f44336;
  color: white;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #da190b;
}
</style>

