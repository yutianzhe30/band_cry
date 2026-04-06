<template>
  <div class="start-page" :style="pageStyle">
    <div class="title-container">
      <h1 class="title">{{ t('startPage.title') }}</h1>

      <!-- Save slots -->
      <div v-if="saveMetas.length > 0" class="saves-section">
        <p class="saves-label">── 继续游戏 ──</p>
        <div
          v-for="meta in saveMetas"
          :key="meta.slot"
          class="save-slot-card"
          @click="continueGame(meta.slot)"
        >
          <span class="save-slot-tag">{{ slotLabel(meta.slot) }}</span>
          <span class="save-slot-name">{{ meta.playerName }}</span>
          <span class="save-slot-info">第 {{ meta.week }} 周 · {{ meta.age }} 岁</span>
          <span class="save-slot-time">{{ formatTime(meta.savedAt) }}</span>
        </div>
      </div>

      <button class="start-button" @click="startGame">{{ t('startPage.startGame') }}</button>
      <button class="start-button" @click="showIntroduction">{{ t('startPage.introduction') }}</button>
      <button class="start-button" @click="showSettings">{{ t('startPage.settings') }}</button>
      <button class="start-button debug-button" @click="showDebug">Debug</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GameLoop } from '../engine/GameLoop';

const { t } = useI18n();

const props = defineProps({
  backgroundImage: { type: String, default: '' },
});

const emit = defineEmits(['start-game', 'continue-game', 'show-introduction', 'show-settings', 'show-debug']);

const saveMetas = ref(
  GameLoop.getSaveMetas().sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
);

const SLOT_LABELS = { autosave: '自动', slot1: '槽1', slot2: '槽2', slot3: '槽3' };
function slotLabel(slot) { return SLOT_LABELS[slot] ?? slot; }

function formatTime(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const pageStyle = computed(() => ({
  backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : 'none',
}));

function startGame() { emit('start-game'); }
function continueGame(slot) { emit('continue-game', slot); }
function showIntroduction() { emit('show-introduction'); }
function showSettings() { emit('show-settings'); }
function showDebug() { emit('show-debug'); }
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

.saves-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}

.saves-label {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
  margin: 0 0 0.3rem;
  letter-spacing: 0.08em;
}

.save-slot-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(25, 118, 210, 0.18);
  border: 1px solid rgba(25, 118, 210, 0.4);
  border-radius: 0.5rem;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}

.save-slot-card:hover {
  background: rgba(25, 118, 210, 0.32);
}

.save-slot-tag {
  font-size: 0.68rem;
  background: rgba(25, 118, 210, 0.35);
  border-radius: 0.25rem;
  padding: 0.1rem 0.35rem;
  color: #90caf9;
  flex-shrink: 0;
}

.save-slot-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  flex: 1;
}

.save-slot-info {
  font-size: 0.75rem;
  color: #90caf9;
}

.save-slot-time {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.35);
}

.debug-button {
  background-color: #ff9800;
}
.debug-button:hover {
  background-color: #f57c00;
}
</style>
