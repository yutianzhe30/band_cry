<template>
  <div class="log-panel" ref="logEl">
    <div class="log-header">日志</div>
    <div class="log-entries">
      <div
        v-for="(entry, i) in entries"
        :key="i"
        class="log-entry"
        :class="{ 'log-entry--event': entry.text.startsWith('选择了') || entry.text.startsWith('【') }"
      >
        <span class="log-week">W{{ entry.week }}</span>
        <span class="log-text">{{ entry.text }}</span>
      </div>
      <div v-if="entries.length === 0" class="log-empty">暂无记录</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, nextTick } from 'vue';
import type { LogEntry } from '../types/GameTypes';

const props = defineProps<{ entries: LogEntry[] }>();

const logEl = ref<HTMLElement | null>(null);

watch(() => props.entries.length, async () => {
  await nextTick();
  if (logEl.value) {
    const container = logEl.value.querySelector('.log-entries');
    if (container) container.scrollTop = container.scrollHeight;
  }
});
</script>

<style scoped>
.log-panel {
  display: flex;
  flex-direction: column;
  background: rgba(5, 5, 20, 0.88);
  border: 1px solid rgba(180, 120, 255, 0.2);
  border-radius: 0.6rem;
  overflow: hidden;
  backdrop-filter: blur(6px);
  max-height: 160px;
}

.log-header {
  font-size: 0.65rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 0.4rem 0.8rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.log-entries {
  overflow-y: auto;
  flex: 1;
  padding: 0.3rem 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(180,120,255,0.2) transparent;
}

.log-entries::-webkit-scrollbar { width: 3px; }
.log-entries::-webkit-scrollbar-thumb { background: rgba(180,120,255,0.3); border-radius: 3px; }

.log-entry {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  padding: 0.18rem 0.8rem;
  font-size: 0.72rem;
  color: #888;
  transition: color 0.2s;
}

.log-entry:hover { color: #bbb; }

.log-entry--event { color: #c080e0; }

.log-week {
  font-size: 0.6rem;
  color: #555;
  min-width: 28px;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.log-text {
  line-height: 1.4;
}

.log-empty {
  padding: 0.5rem 0.8rem;
  font-size: 0.72rem;
  color: #444;
  font-style: italic;
}
</style>
