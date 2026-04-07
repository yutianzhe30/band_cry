<template>
  <div class="action-panel">
    <!-- AP row: dots + week label + end-week -->
    <div class="ap-row">
      <div class="ap-dots">
        <span
          v-for="i in MAX_AP"
          :key="i"
          class="ap-dot"
          :class="{ filled: i <= currentAP }"
        ></span>
        <span class="ap-text">{{ currentAP }}/{{ MAX_AP }}</span>
      </div>
      <span class="week-label">第 {{ week }} 周</span>
      <button class="end-week-btn" @click="$emit('end-week')">结束本周 →</button>
    </div>

    <!-- 5-action grid: 3+2 on mobile, 5-in-a-row on wide screens -->
    <div class="action-grid">
      <button
        v-for="action in actions"
        :key="action.id"
        class="action-btn"
        :disabled="currentAP < action.cost.ap"
        @click="$emit('perform', action.id)"
      >
        <span class="action-icon">{{ actionIcon(action.id) }}</span>
        <span class="action-name">{{ action.name }}</span>
        <span class="action-cost">{{ action.cost.ap }}AP</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameAction } from '../types/GameTypes';

const MAX_AP = 4;

defineProps<{
  actions: GameAction[];
  currentAP: number;
  week: number;
}>();

defineEmits<{
  perform: [actionId: string];
  'end-week': [];
}>();

const icons: Record<string, string> = {
  practice:  '🎸',
  rehearse:  '🥁',
  socialize: '🤝',
  study:     '📚',
  work:      '💼',
  workout:   '🏋️',
  rest:      '🛌',
};

function actionIcon(id: string): string { return icons[id] ?? '🎵'; }
</script>

<style scoped>
.action-panel {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* ── AP row ── */
.ap-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ap-dots {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.ap-dot {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background 0.2s, box-shadow 0.2s;
}

.ap-dot.filled {
  background: #e040fb;
  border-color: #e040fb;
  box-shadow: 0 0 6px rgba(224, 64, 251, 0.7);
}

.ap-text {
  font-size: 0.68rem;
  color: #888;
  margin-left: 0.1rem;
}

.week-label {
  font-size: 0.75rem;
  color: #888;
  margin-left: auto;
}

.end-week-btn {
  background: rgba(224, 64, 251, 0.12);
  border: 1px solid rgba(224, 64, 251, 0.45);
  border-radius: 0.35rem;
  color: #e040fb;
  padding: 0.38rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: background 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}

.end-week-btn:hover {
  background: rgba(224, 64, 251, 0.25);
  box-shadow: 0 0 10px rgba(224, 64, 251, 0.3);
}

/* ── Action grid ── */
/* Mobile: 3 columns; wider screens: 5 columns */
.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

@media (min-width: 540px) {
  .action-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.55rem;
  padding: 0.7rem 0.4rem;
  cursor: pointer;
  color: #ddd;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  /* Mobile: large touch target */
  min-height: 56px;
}

.action-btn:hover:not(:disabled) {
  background: rgba(224, 64, 251, 0.12);
  border-color: rgba(224, 64, 251, 0.5);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.action-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.action-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #eee;
  letter-spacing: 0.02em;
}

.action-cost {
  font-size: 0.6rem;
  color: #666;
  margin-top: -0.1rem;
}
</style>
