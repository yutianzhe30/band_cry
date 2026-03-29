<template>
  <div class="action-panel">
    <div class="panel-header">
      <span class="week-label">第 {{ week }} 周</span>
      <div class="ap-display">
        <span
          v-for="i in MAX_AP"
          :key="i"
          class="ap-dot"
          :class="{ filled: i <= currentAP }"
        ></span>
        <span class="ap-text">{{ currentAP }} AP</span>
      </div>
    </div>

    <div class="actions-grid">
      <button
        v-for="action in actions"
        :key="action.id"
        class="action-btn"
        :disabled="currentAP < action.cost.ap"
        @click="$emit('perform', action.id)"
      >
        <span class="action-icon">{{ actionIcon(action.id) }}</span>
        <span class="action-name">{{ action.name }}</span>
        <span class="action-desc">{{ action.description }}</span>
        <div class="action-effects">
          <span
            v-for="eff in action.effects.slice(0, 3)"
            :key="eff.stat"
            class="effect-badge"
            :class="eff.op === 'add' ? 'pos' : 'neg'"
          >
            {{ eff.op === 'add' ? '+' : '-' }}{{ eff.stat === 'money' ? '¥' : '' }}{{ Math.abs(eff.value) }}
            {{ shortStatName(eff.stat) }}
          </span>
        </div>
      </button>
    </div>

    <button class="end-week-btn" @click="$emit('end-week')">
      结束本周 →
    </button>
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
  compose:   '✍️',
  gig:       '🎤',
  rehearse:  '🥁',
  socialize: '🍺',
  work:      '💼',
  rest:      '😴',
};

const shortNames: Record<string, string> = {
  technique:         '技术',
  charm:             '魅力',
  sanity:            '精神',
  health:            '健康',
  artistic_integrity:'艺术',
  fame:              '名望',
  money:             '',
  band_chemistry:    '默契',
};

function actionIcon(id: string): string { return icons[id] ?? '🎵'; }
function shortStatName(stat: string): string { return shortNames[stat] ?? stat; }
</script>

<style scoped>
.action-panel {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.week-label {
  font-size: 0.8rem;
  color: #888;
  letter-spacing: 0.05em;
}

.ap-display {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ap-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  transition: background 0.2s, box-shadow 0.2s;
}

.ap-dot.filled {
  background: #e040fb;
  border-color: #e040fb;
  box-shadow: 0 0 6px rgba(224, 64, 251, 0.7);
}

.ap-text {
  font-size: 0.7rem;
  color: #999;
  margin-left: 0.2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  flex: 1;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.5rem;
  padding: 0.55rem 0.6rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  color: #ddd;
}

.action-btn:hover:not(:disabled) {
  background: rgba(224, 64, 251, 0.1);
  border-color: rgba(224, 64, 251, 0.45);
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.action-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.action-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #eee;
}

.action-desc {
  font-size: 0.65rem;
  color: #777;
  line-height: 1.3;
}

.action-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  margin-top: 0.1rem;
}

.effect-badge {
  font-size: 0.6rem;
  padding: 0.1rem 0.3rem;
  border-radius: 2px;
  font-weight: 600;
}

.effect-badge.pos {
  background: rgba(67, 233, 123, 0.15);
  color: #43e97b;
}

.effect-badge.neg {
  background: rgba(249, 83, 198, 0.15);
  color: #f953c6;
}

.end-week-btn {
  background: rgba(224, 64, 251, 0.1);
  border: 1px solid rgba(224, 64, 251, 0.4);
  border-radius: 0.4rem;
  color: #e040fb;
  padding: 0.5rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  align-self: flex-end;
  letter-spacing: 0.04em;
}

.end-week-btn:hover {
  background: rgba(224, 64, 251, 0.2);
  box-shadow: 0 0 12px rgba(224, 64, 251, 0.3);
}
</style>
