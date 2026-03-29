<template>
  <div class="stat-panel">
    <div class="player-info">
      <span class="player-name">{{ playerName }}</span>
      <span class="player-role">{{ roleLabel }}</span>
    </div>

    <div class="stats-list">
      <div v-for="stat in regularStats" :key="stat.id" class="stat-row">
        <span class="stat-name">{{ stat.name }}</span>
        <div class="bar-track">
          <div
            class="bar-fill"
            :style="{ width: `${stat.value}%`, background: barColor(stat.value) }"
          ></div>
        </div>
        <span class="stat-num">{{ Math.round(stat.value) }}</span>
      </div>

      <div class="stat-row money-row">
        <span class="stat-name">金钱</span>
        <span class="money-value">¥{{ Math.round(moneyValue) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StatDefinition } from '../types/GameTypes';

const props = defineProps<{
  stats: Record<string, number>;
  statDefs: StatDefinition[];
  playerName: string;
  playerRole: string;
}>();

const roleNames: Record<string, string> = {
  Guitar: '吉他手', Bass: '贝斯手', Keyboard: '键盘手',
  Vocal: '主唱', Drum: '鼓手',
};

const roleLabel = computed(() => roleNames[props.playerRole] ?? props.playerRole);

const regularStats = computed(() =>
  props.statDefs
    .filter(d => d.id !== 'money')
    .map(d => ({ id: d.id, name: d.name, value: props.stats[d.id] ?? 0 }))
);

const moneyValue = computed(() => props.stats['money'] ?? 0);

function barColor(val: number): string {
  if (val >= 70) return 'linear-gradient(90deg, #43e97b, #38f9d7)';
  if (val >= 40) return 'linear-gradient(90deg, #f7971e, #ffd200)';
  return 'linear-gradient(90deg, #f953c6, #b91d73)';
}
</script>

<style scoped>
.stat-panel {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: rgba(5, 5, 20, 0.88);
  border: 1px solid rgba(180, 120, 255, 0.25);
  border-radius: 0.6rem;
  padding: 0.9rem 1rem;
  min-width: 170px;
  backdrop-filter: blur(6px);
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-bottom: 0.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.player-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e0b4ff;
  letter-spacing: 0.05em;
}

.player-role {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.stat-name {
  font-size: 0.7rem;
  color: #aaa;
  min-width: 42px;
  letter-spacing: 0.02em;
}

.bar-track {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.stat-num {
  font-size: 0.65rem;
  color: #ccc;
  min-width: 22px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.money-row {
  margin-top: 0.3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.4rem;
}

.money-value {
  font-size: 0.82rem;
  color: #ffd200;
  font-weight: 600;
  margin-left: auto;
}
</style>
