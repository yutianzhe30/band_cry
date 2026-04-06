<template>
  <div class="log-page">
    <div v-if="entries.length === 0" class="log-empty">暂无记录</div>
    <div v-else class="log-groups">
      <div v-for="group in groups" :key="group.week" class="log-group">
        <button class="group-header" @click="toggle(group.week)">
          <span class="group-chevron">{{ collapsed.has(group.week) ? '▶' : '▼' }}</span>
          <span class="group-title">第 {{ group.week }} 周</span>
        </button>
        <transition name="collapse">
          <div v-if="!collapsed.has(group.week)" class="group-entries">
            <div
              v-for="(entry, i) in group.entries"
              :key="i"
              class="log-entry"
              :class="{ 'log-entry--event': entry.text.startsWith('选择了') || entry.text.startsWith('【') }"
            >
              <span class="log-bullet">•</span>
              <span class="log-text">{{ entry.text }}</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { LogEntry } from '../types/GameTypes';

const props = defineProps<{ entries: LogEntry[] }>();

interface Group { week: number; entries: LogEntry[] }

const groups = computed<Group[]>(() => {
  const map = new Map<number, LogEntry[]>();
  for (const e of props.entries) {
    if (!map.has(e.week)) map.set(e.week, []);
    map.get(e.week)!.push(e);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b - a) // latest week first
    .map(([week, entries]) => ({ week, entries }));
});

const collapsed = ref(new Set<number>());

function toggle(week: number) {
  if (collapsed.value.has(week)) collapsed.value.delete(week);
  else collapsed.value.add(week);
  // trigger reactivity
  collapsed.value = new Set(collapsed.value);
}
</script>

<style scoped>
.log-page {
  flex: 1;
  overflow-y: auto;
  padding: 0.8rem 1.2rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(180, 120, 255, 0.2) transparent;
}

.log-page::-webkit-scrollbar { width: 4px; }
.log-page::-webkit-scrollbar-thumb { background: rgba(180, 120, 255, 0.3); border-radius: 4px; }

.log-empty {
  color: #555;
  font-size: 0.82rem;
  font-style: italic;
  padding: 2rem;
  text-align: center;
}

.log-groups {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.log-group {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.4rem;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: none;
  color: #aaa;
  font-size: 0.78rem;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}

.group-header:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #ccc;
}

.group-chevron {
  font-size: 0.6rem;
  color: #666;
  width: 12px;
  flex-shrink: 0;
}

.group-title {
  font-weight: 600;
  color: #c0a0e0;
}

.group-entries {
  padding: 0.3rem 0 0.5rem 1.8rem;
}

.log-entry {
  display: flex;
  gap: 0.4rem;
  align-items: baseline;
  padding: 0.15rem 0;
  font-size: 0.75rem;
  color: #888;
}

.log-entry--event {
  color: #c080e0;
}

.log-bullet {
  font-size: 0.65rem;
  color: #555;
  flex-shrink: 0;
}

.log-text {
  line-height: 1.5;
}

.collapse-enter-active,
.collapse-leave-active { transition: opacity 0.15s; }
.collapse-enter-from,
.collapse-leave-to { opacity: 0; }
</style>
