<template>
  <div class="start-page" :style="pageStyle">
    <div class="title-container">
      <h1 class="title">{{ t('startPage.title') }}</h1>
      <button class="start-button" @click="startGame">{{ t('startPage.startGame') }}</button>
      <button class="start-button" @click="showIntroduction">{{ t('startPage.introduction') }}</button>
      <button class="start-button" @click="showSettings">{{ t('startPage.settings') }}</button>
      <button class="start-button debug-button" @click="showDebug">Debug</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  backgroundImage: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['start-game', 'show-introduction', 'show-settings', 'show-debug']);

const pageStyle = computed(() => ({
  backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : 'none',
}));

function startGame() {
  emit('start-game');
}

function showIntroduction() {
  emit('show-introduction');
}

function showSettings() {
  emit('show-settings');
}

function showDebug() {
  emit('show-debug');
}
</script>

<style scoped>
.start-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-size: cover;
  background-position: center;
  text-align: center;
}

.title-container {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2rem;
  border-radius: 1rem;
}

.title {
  font-size: 5rem;
  color: white;
  text-shadow: 2px 2px 4px #000000;
}

.start-button {
  margin-top: 2rem;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  border-radius: 0.5rem;
  border: none;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 1rem;
}

.start-button:hover {
  background-color: #45a049;
}

.debug-button {
  background-color: #ff9800;
}
.debug-button:hover {
  background-color: #f57c00;
}
</style>
