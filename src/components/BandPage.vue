<template>
  <div class="band-page">
    <div class="members-area">
      <!-- No members yet: placeholder -->
      <div v-if="bandMembers.length === 0" class="no-members">
        <p class="no-members-title">乐队尚未组建</p>
        <p class="no-members-hint">通过游戏中的事件招募成员</p>
      </div>

      <!-- Member cards -->
      <div v-else class="members-grid">
        <div v-for="member in bandMembers" :key="member.id" class="member-card">
          <div class="member-role-icon">{{ roleIcon(member.role) }}</div>
          <div class="member-info">
            <span class="member-name">{{ member.name }}</span>
            <span class="member-role-label">{{ roleLabel(member.role) }}</span>
          </div>
          <div class="chemistry-row">
            <span class="chemistry-label">化学值</span>
            <div class="chemistry-bar">
              <div class="chemistry-fill" :style="{ width: member.chemistry + '%' }"></div>
            </div>
            <span class="chemistry-num">{{ member.chemistry }}</span>
          </div>
          <div class="mood-row">
            <span class="mood-label">状态</span>
            <span class="mood-value" :class="'mood--' + member.mood">{{ moodLabel(member.mood) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Band overall panel -->
    <div class="band-overall">
      <div class="overall-label">乐队整体默契</div>
      <div class="overall-bar-row">
        <div class="chemistry-bar overall-bar">
          <div class="chemistry-fill" :style="{ width: overallChemistry + '%' }"></div>
        </div>
        <span class="overall-num">{{ bandMembers.length > 0 ? overallChemistry : '—' }}</span>
      </div>
      <div class="band-status">
        当前状态：{{ bandMembers.length === 0 ? '单飞' : '排练中' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BandMember } from '../types/GameTypes';

const props = defineProps<{ bandMembers: BandMember[] }>();

const overallChemistry = computed(() => {
  if (props.bandMembers.length === 0) return 0;
  const sum = props.bandMembers.reduce((acc, m) => acc + m.chemistry, 0);
  return Math.round(sum / props.bandMembers.length);
});

const ROLE_ICONS: Record<string, string> = {
  Guitar: '🎸', Bass: '🎸', Keyboard: '🎹', Vocal: '🎤', Drum: '🥁',
};
const ROLE_LABELS: Record<string, string> = {
  Guitar: '吉他', Bass: '贝斯', Keyboard: '键盘', Vocal: '主唱', Drum: '鼓手',
};
const MOOD_LABELS: Record<string, string> = {
  happy: '状态佳', neutral: '稳定', unhappy: '不满',
};

function roleIcon(role: string) { return ROLE_ICONS[role] ?? '🎵'; }
function roleLabel(role: string) { return ROLE_LABELS[role] ?? role; }
function moodLabel(mood: string) { return MOOD_LABELS[mood] ?? mood; }
</script>

<style scoped>
.band-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.8rem 1.2rem;
  gap: 0.8rem;
  overflow-y: auto;
}

.members-area {
  flex: 1;
  display: flex;
  align-items: flex-start;
}

.no-members {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 120px;
  color: #555;
}

.no-members-title {
  font-size: 0.9rem;
  margin: 0;
}

.no-members-hint {
  font-size: 0.75rem;
  font-style: italic;
  margin: 0;
  color: #444;
}

.members-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.member-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(180, 120, 255, 0.2);
  border-radius: 0.6rem;
  padding: 0.8rem 1rem;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.member-role-icon {
  font-size: 1.4rem;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e8e8e8;
}

.member-role-label {
  font-size: 0.72rem;
  color: #888;
}

.chemistry-row,
.mood-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
}

.chemistry-label,
.mood-label {
  color: #666;
  min-width: 36px;
}

.chemistry-bar {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.chemistry-fill {
  height: 100%;
  background: linear-gradient(90deg, #7b4fcf, #e040fb);
  border-radius: 3px;
  transition: width 0.4s;
}

.chemistry-num {
  font-size: 0.68rem;
  color: #888;
  min-width: 20px;
  text-align: right;
}

.mood-value {
  font-size: 0.72rem;
}

.mood--happy   { color: #81c784; }
.mood--neutral { color: #aaa; }
.mood--unhappy { color: #e57373; }

/* Overall panel */
.band-overall {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(180, 120, 255, 0.15);
  border-radius: 0.5rem;
  padding: 0.7rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.overall-label {
  font-size: 0.72rem;
  color: #888;
}

.overall-bar-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.overall-bar {
  flex: 1;
  height: 7px;
}

.overall-num {
  font-size: 0.78rem;
  color: #aaa;
  min-width: 24px;
  text-align: right;
}

.band-status {
  font-size: 0.72rem;
  color: #777;
}
</style>
