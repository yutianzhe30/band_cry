<template>
  <div class="dialog-backdrop" @click.self="$emit('close')">
    <div class="dialog-box">
      <div class="dialog-header">
        <span class="dialog-title">{{ mode === 'save' ? '保存游戏' : '管理存档' }}</span>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Autosave (read-only) -->
      <div class="slot-row slot-auto">
        <div class="slot-label">自动存档</div>
        <div v-if="autoMeta" class="slot-info">
          <span class="slot-name">{{ autoMeta.playerName }}</span>
          <span class="slot-week">第 {{ autoMeta.week }} 周 · {{ autoMeta.age }} 岁</span>
          <span class="slot-time">{{ formatTime(autoMeta.savedAt) }}</span>
        </div>
        <div v-else class="slot-empty">（无自动存档）</div>
        <div class="slot-actions">
          <button v-if="autoMeta && mode !== 'save'" class="btn-load" @click="onLoad('autosave')">加载</button>
        </div>
      </div>

      <!-- Manual slots -->
      <div v-for="slot in MANUAL_SLOTS" :key="slot.id" class="slot-row">
        <div class="slot-label">{{ slot.label }}</div>
        <div v-if="getMeta(slot.id)" class="slot-info">
          <span class="slot-name">{{ getMeta(slot.id)!.playerName }}</span>
          <span class="slot-week">第 {{ getMeta(slot.id)!.week }} 周 · {{ getMeta(slot.id)!.age }} 岁</span>
          <span class="slot-time">{{ formatTime(getMeta(slot.id)!.savedAt) }}</span>
        </div>
        <div v-else class="slot-empty">（空槽位）</div>
        <div class="slot-actions">
          <button v-if="mode === 'save'" class="btn-save" @click="onSave(slot.id)">
            {{ getMeta(slot.id) ? '覆盖' : '存入' }}
          </button>
          <template v-else>
            <button v-if="getMeta(slot.id)" class="btn-load" @click="onLoad(slot.id)">加载</button>
            <button v-if="getMeta(slot.id)" class="btn-delete" @click="onDelete(slot.id)">删除</button>
          </template>
        </div>
      </div>

      <div v-if="confirmSlot" class="confirm-bar">
        <span>覆盖「{{ confirmSlot }}」的存档？</span>
        <button class="btn-confirm" @click="confirmSave">确认</button>
        <button class="btn-cancel" @click="confirmSlot = null">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { SaveMeta } from '../engine/GameLoop';

const props = defineProps<{
  metas: SaveMeta[];
  mode: 'save' | 'manage';
}>();

const emit = defineEmits<{
  'save-to': [slot: string];
  'load-from': [slot: string];
  'delete': [slot: string];
  close: [];
}>();

const MANUAL_SLOTS = [
  { id: 'slot1', label: '槽位 1' },
  { id: 'slot2', label: '槽位 2' },
  { id: 'slot3', label: '槽位 3' },
];

const confirmSlot = ref<string | null>(null);

const autoMeta = computed(() => props.metas.find(m => m.slot === 'autosave') ?? null);
function getMeta(slot: string): SaveMeta | undefined {
  return props.metas.find(m => m.slot === slot);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function onSave(slot: string) {
  if (getMeta(slot)) {
    confirmSlot.value = slot;
  } else {
    emit('save-to', slot);
    emit('close');
  }
}

function confirmSave() {
  if (confirmSlot.value) {
    emit('save-to', confirmSlot.value);
    confirmSlot.value = null;
    emit('close');
  }
}

function onLoad(slot: string) {
  emit('load-from', slot);
  emit('close');
}

function onDelete(slot: string) {
  emit('delete', slot);
}
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.dialog-box {
  background: rgba(10, 10, 30, 0.97);
  border: 1px solid rgba(180, 120, 255, 0.3);
  border-radius: 0.8rem;
  width: 480px;
  max-width: 94vw;
  padding: 1.2rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  color: #ddd;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding-bottom: 0.7rem;
}

.dialog-title {
  font-size: 1rem;
  font-weight: 700;
  color: #e0b4ff;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.1rem 0.3rem;
  transition: color 0.15s;
}
.close-btn:hover { color: #ccc; }

.slot-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 0.5rem;
  padding: 0.65rem 0.8rem;
}

.slot-auto {
  border-color: rgba(224, 64, 251, 0.2);
  background: rgba(224, 64, 251, 0.04);
}

.slot-label {
  font-size: 0.75rem;
  color: #888;
  min-width: 60px;
  flex-shrink: 0;
}

.slot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.slot-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #eee;
}

.slot-week {
  font-size: 0.72rem;
  color: #aaa;
}

.slot-time {
  font-size: 0.68rem;
  color: #666;
}

.slot-empty {
  flex: 1;
  font-size: 0.75rem;
  color: #555;
  font-style: italic;
}

.slot-actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

button {
  border: none;
  border-radius: 0.3rem;
  padding: 0.28rem 0.65rem;
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save  { background: rgba(33, 150, 243, 0.2); color: #64b5f6; border: 1px solid rgba(33,150,243,0.3); }
.btn-save:hover { background: rgba(33, 150, 243, 0.35); }

.btn-load  { background: rgba(76, 175, 80, 0.2); color: #81c784; border: 1px solid rgba(76,175,80,0.3); }
.btn-load:hover { background: rgba(76, 175, 80, 0.35); }

.btn-delete { background: rgba(244, 67, 54, 0.15); color: #e57373; border: 1px solid rgba(244,67,54,0.25); }
.btn-delete:hover { background: rgba(244, 67, 54, 0.3); }

.confirm-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.25);
  border-radius: 0.4rem;
  padding: 0.55rem 0.8rem;
  font-size: 0.8rem;
  color: #ef9a9a;
}

.confirm-bar span { flex: 1; }

.btn-confirm { background: rgba(244, 67, 54, 0.3); color: #ef9a9a; border: 1px solid rgba(244,67,54,0.4); }
.btn-confirm:hover { background: rgba(244, 67, 54, 0.5); }

.btn-cancel { background: rgba(255,255,255,0.07); color: #999; border: 1px solid rgba(255,255,255,0.12); }
.btn-cancel:hover { background: rgba(255,255,255,0.12); }
</style>
