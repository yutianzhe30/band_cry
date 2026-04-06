<template>
  <nav class="tab-bar" :class="{ 'tab-bar--locked': locked }">
    <button
      v-for="tab in TABS"
      :key="tab.id"
      class="tab-btn"
      :class="{ 'tab-btn--active': currentTab === tab.id }"
      :disabled="locked"
      @click="!locked && $emit('change', tab.id)"
    >{{ tab.label }}</button>
  </nav>
</template>

<script setup lang="ts">
const TABS = [
  { id: 'action', label: '行动' },
  { id: 'band',   label: '乐队' },
  { id: 'log',    label: '日志' },
] as const;

defineProps<{
  currentTab: string;
  locked: boolean;
}>();

defineEmits<{ change: [tab: string] }>();
</script>

<style scoped>
.tab-bar {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 0;
  background: rgba(4, 4, 18, 0.82);
  border-bottom: 1px solid rgba(180, 120, 255, 0.15);
  padding: 0 1.2rem;
}

.tab-bar--locked {
  opacity: 0.55;
  pointer-events: none;
}

.tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #777;
  font-size: 0.78rem;
  padding: 0.45rem 1rem;
  cursor: pointer;
  letter-spacing: 0.06em;
  transition: color 0.15s, border-color 0.15s;
  font-family: inherit;
}

.tab-btn:hover:not(:disabled) {
  color: #bbb;
}

.tab-btn--active {
  color: #e0b4ff;
  border-bottom-color: rgba(180, 120, 255, 0.7);
}

.tab-btn:disabled {
  cursor: not-allowed;
}
</style>
