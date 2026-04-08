<template>
  <div class="game-root" :class="`scene--${currentScene}`">

    <!-- Save dialog (modal overlay) -->
    <SaveSlotDialog
      v-if="showSaveDialog"
      :metas="saveMetas"
      mode="save"
      @save-to="onSaveTo"
      @load-from="onLoadFrom"
      @delete="onDeleteSlot"
      @close="showSaveDialog = false"
    />

    <!-- ── Background ── -->
    <div class="scene-bg" :style="bgStyle"></div>
    <div class="scene-overlay"></div>

    <!-- ── Header ── -->
    <header class="game-header">
      <span class="hdr-name">{{ state.playerName }}</span>
      <span class="hdr-sep">·</span>
      <span class="hdr-week">第 {{ state.week }} 周</span>
      <span class="hdr-sep">·</span>
      <span class="hdr-date">{{ formattedDate }}</span>
      <button class="hdr-save-btn" @click="openSaveDialog">保存</button>
    </header>

    <!-- ── TabBar ── -->
    <TabBar
      :current-tab="currentTab"
      :locked="state.phase !== 'action'"
      @change="currentTab = $event"
    />

    <!-- ── Content area: character stage / band / log ── -->
    <div class="content-area">

      <!-- Action tab: character stage -->
      <template v-if="currentTab === 'action'">
        <div class="character-stage">
          <!-- Character sprite placeholder -->
          <div class="character-sprite">
            <span class="sprite-label">人物立绘</span>
          </div>
        </div>
      </template>

      <!-- Band tab -->
      <BandPage
        v-else-if="currentTab === 'band'"
        :band-members="state.bandMembers"
      />

      <!-- Log tab -->
      <LogPage
        v-else-if="currentTab === 'log'"
        :entries="state.log"
      />

    </div>

    <!-- ── VN Box (shown on action tab always; on other tabs only for events) ── -->
    <div
      v-if="currentTab === 'action' || state.phase !== 'action'"
      class="vn-box"
      :class="{ 'vn-box--event': state.phase === 'event', 'vn-box--ending': state.phase === 'ending' }"
    >

      <!-- Mini stat strip (only in action tab) -->
      <div v-if="currentTab === 'action'" class="stat-strip">
        <span
          v-for="s in miniStats"
          :key="s.id"
          class="stat-chip"
          :class="statChipClass(s.id, s.value)"
        >
          <span class="stat-chip-icon">{{ s.icon }}</span>
          <span class="stat-chip-val">{{ Math.round(s.value) }}</span>
        </span>
        <span class="stat-chip money-chip">
          <span class="stat-chip-icon">¥</span>
          <span class="stat-chip-val">{{ Math.round(state.stats['money'] ?? 0) }}</span>
        </span>
        <!-- Debug overlay: hidden stats visible only in debug mode -->
        <template v-if="isDebugMode">
          <span class="stat-chip debug-chip">
            <span class="stat-chip-icon">🎵</span>
            <span class="stat-chip-val">{{ Math.round(state.stats['band_chemistry'] ?? 0) }}</span>
          </span>
          <span class="stat-chip debug-chip">
            <span class="stat-chip-icon">💕</span>
            <span class="stat-chip-val">{{ Math.round(state.stats['affection'] ?? 0) }}</span>
          </span>
        </template>
      </div>

      <!-- ── ACTION phase ── -->
      <template v-if="state.phase === 'action' && currentTab === 'action'">
        <p class="vn-narrative">{{ flavorText }}</p>
        <ActionPanel
          :actions="availableActions"
          :current-a-p="state.ap"
          :week="state.week"
          @perform="onPerformAction"
          @end-week="onEndWeek"
        />
      </template>

      <!-- ── EVENT phase ── -->
      <template v-else-if="state.phase === 'event' && state.currentEvent">
        <p class="vn-event-text">{{ state.currentEvent.description }}</p>
        <p v-if="state.currentEvent.narrative" class="vn-event-narrative">{{ state.currentEvent.narrative }}</p>
        <div class="vn-choices">
          <button
            v-for="(choice, i) in availableChoices"
            :key="i"
            class="vn-choice-btn"
            :class="{ 'has-skill-check': !!choice.skill_check }"
            @click="onChooseEvent(choice)"
          >
            <span class="choice-arrow">▸</span>
            {{ choice.text }}
            <span v-if="choice.skill_check" class="skill-check-tag">
              {{ skillCheckLabel(choice.skill_check.stat) }} 检定
              ({{ skillCheckOdds(choice.skill_check.stat, choice.skill_check.difficulty) }})
            </span>
          </button>
        </div>
      </template>

      <!-- ── SUMMARY phase ── -->
      <template v-else-if="state.phase === 'summary'">
        <p class="vn-summary-title">── 本月结算 ──</p>
        <div class="vn-summary-lines">
          <p v-for="(line, i) in state.weekSummary" :key="i" class="vn-summary-line">{{ line }}</p>
        </div>
        <button class="vn-continue-btn" @click="dismissSummary">继续 →</button>
      </template>

      <!-- ── ENDING phase ── -->
      <template v-else-if="state.phase === 'ending' && state.currentEnding">
        <p class="ending-title">{{ state.currentEnding.title }}</p>
        <p class="ending-desc">{{ state.currentEnding.description }}</p>
        <p v-if="state.currentEnding.epilogue" class="ending-epilogue">{{ state.currentEnding.epilogue }}</p>
        <button class="ending-restart" @click="$emit('restart')">重新开始</button>
      </template>

    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue';
import { GameLoop } from '../engine/GameLoop';
import type { SaveMeta } from '../engine/GameLoop';
import { StatSystem } from '../engine/StatSystem';
import { checkRequirements } from '../engine/TriggerEvaluator';
import type { GameEvent, GameEnding, EventChoice, LogEntry, GameState, GameAction, BandMember } from '../types/GameTypes';
import StatBar from './StatBar.vue';
import ActionPanel from './ActionPanel.vue';
import SaveSlotDialog from './SaveSlotDialog.vue';
import TabBar from './TabBar.vue';
import BandPage from './BandPage.vue';
import LogPage from './LogPage.vue';
import probeRoomBg from '../assets/images/ProbeRoom1.png';

const props = defineProps<{
  character: { name: string; gender: 'Male' | 'Female'; instrument: string };
  loadFromSave?: boolean | string;
}>();

defineEmits<{ restart: [] }>();

// ── Engine ────────────────────────────────────────────────
const loadSlot = typeof props.loadFromSave === 'string' ? props.loadFromSave
  : props.loadFromSave === true ? 'autosave' : null;

let gameLoop = (loadSlot && GameLoop.fromSave(loadSlot)) || new GameLoop({
  name: props.character.name || '无名乐手',
  gender: props.character.gender,
  role: props.character.instrument as any,
});

const statSystem = StatSystem.getInstance();

// ── Reactive UI state ─────────────────────────────────────
interface UIState {
  playerName: string;
  playerRole: string;
  week: number;
  age: number;
  ap: number;
  stats: Record<string, number>;
  log: LogEntry[];
  bandMembers: BandMember[];
  phase: 'action' | 'event' | 'summary' | 'ending';
  currentEvent: GameEvent | null;
  currentEnding: GameEnding | null;
  weekSummary: string[];
  currentDate: Date;
}

const state = reactive<UIState>({
  playerName: gameLoop.gameState.player.name,
  playerRole: gameLoop.gameState.player.role,
  week: 1,
  age: 18,
  ap: 4,
  stats: {},
  log: [],
  bandMembers: [],
  phase: 'action',
  currentEvent: null,
  currentEnding: null,
  weekSummary: [],
  currentDate: new Date(),
});

const currentTab = ref<'action' | 'band' | 'log'>('action');

const rawGameState = computed((): GameState => gameLoop.gameState);

function syncState() {
  const gs = gameLoop.gameState;
  const statsObj: Record<string, number> = {};
  gs.player.stats.forEach((v, k) => { statsObj[k] = v; });
  state.stats = statsObj;
  state.ap = gs.actionPoints;
  state.week = gs.week;
  state.age = gameLoop.getAge();
  state.log = [...gs.log];
  state.bandMembers = [...gs.bandMembers];
  state.currentDate = new Date(gs.currentDate);
}

// ── Computed ──────────────────────────────────────────────
const availableActions = computed<GameAction[]>(() => gameLoop.getAvailableActions());

const availableChoices = computed(() => {
  if (!state.currentEvent) return [];
  return state.currentEvent.choices.filter(c =>
    !c.requirements || checkRequirements(c.requirements, rawGameState.value, state.age)
  );
});


const formattedDate = computed(() => {
  const d = state.currentDate;
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
});

const currentScene = computed(() => {
  if (state.phase === 'ending') return 'ending';
  if (state.phase === 'event') return 'event';
  return 'default';
});

const bgStyle = computed(() => ({ backgroundImage: `url(${probeRoomBg})` }));

// Mini stat strip: visible stats only (band_chemistry and affection are hidden)
interface MiniStat { id: string; icon: string; value: number }
const MINI_STAT_CONFIG: { id: string; icon: string }[] = [
  { id: 'technique',         icon: '🎸' },
  { id: 'intelligence',      icon: '📖' },
  { id: 'charm',             icon: '✨' },
  { id: 'sanity',            icon: '💜' },
  { id: 'health',            icon: '❤️' },
  { id: 'fame',              icon: '⭐' },
  { id: 'artistic_integrity',icon: '🎨' },
];

// Debug mode: ?debug=1 in URL shows hidden stats
const isDebugMode = new URLSearchParams(window.location.search).get('debug') === '1';

const miniStats = computed<MiniStat[]>(() =>
  MINI_STAT_CONFIG.map(c => ({ id: c.id, icon: c.icon, value: state.stats[c.id] ?? 0 }))
);

function statChipClass(id: string, val: number): string {
  if (val >= 70) return 'stat-chip--high';
  if (val >= 35) return 'stat-chip--mid';
  return 'stat-chip--low';
}

// Flavor text: deterministic per week
const FLAVOR_POOL = [
  '这周你感觉状态不错，排练室里的空气都带着些许兴奋。',
  '窗外飘来阵阵小雨，你坐在排练室里发了很久的呆。',
  '最近城里来了几支新乐队，你在想自己差距有多大。',
  '你的手指在闲暇时总是不自觉地拨弄琴弦，停不下来。',
  '地下室的隔音很差，楼上的脚步声一直干扰你的练习。',
  '有人说，音乐是孤独者的语言。你深有同感。',
  '本周让你意识到，台上的一分钟需要台下十年功。',
  '你在回家路上哼起自己写的旋律，路人给了你一个奇怪的眼神。',
  '排练结束后，你一个人坐在空旷的房间里，感受着残留的回声。',
  '这周的创作遇到了瓶颈，灵感就像干涸的河床，一点都挤不出来。',
  '今天天气很好，你想出去走走，但又放不下手里的乐器。',
  '生活有时候就是这样——平静，但充满了某种无法言说的期待。',
];
const flavorText = computed(() => FLAVOR_POOL[state.week % FLAVOR_POOL.length]);

// ── Handlers ──────────────────────────────────────────────
function onPerformAction(actionId: string) {
  gameLoop.performAction(actionId);
  syncState();
  if (gameLoop.gameState.actionPoints === 0) onEndWeek();
}

function onEndWeek() {
  const result = gameLoop.endTurn();
  syncState();
  gameLoop.saveState('autosave');

  if (result.summary.length > 0) {
    state.weekSummary = result.summary;
    state.phase = 'summary';
    pendingEvent = result.event;
    pendingEnding = result.ending;
  } else if (result.event) {
    state.currentEvent = result.event;
    state.phase = 'event';
  } else if (result.ending) {
    state.currentEnding = result.ending;
    state.phase = 'ending';
  }
}

let pendingEvent: GameEvent | null = null;
let pendingEnding: GameEnding | null = null;

// ── Save dialog ───────────────────────────────────────────
const showSaveDialog = ref(false);
const saveMetas = ref<SaveMeta[]>([]);

function openSaveDialog() {
  saveMetas.value = GameLoop.getSaveMetas();
  showSaveDialog.value = true;
}

function onSaveTo(slot: string) {
  gameLoop.saveState(slot);
  saveMetas.value = GameLoop.getSaveMetas();
}

function onLoadFrom(slot: string) {
  const loaded = GameLoop.fromSave(slot);
  if (loaded) {
    gameLoop = loaded;
    syncState();
    state.phase = 'action';
    state.currentEvent = null;
    state.currentEnding = null;
    state.weekSummary = [];
    currentTab.value = 'action';
    showSaveDialog.value = false;
  }
}

function onDeleteSlot(slot: string) {
  GameLoop.deleteSave(slot);
  saveMetas.value = GameLoop.getSaveMetas();
}

function dismissSummary() {
  state.weekSummary = [];
  if (pendingEvent) {
    state.currentEvent = pendingEvent;
    state.phase = 'event';
    pendingEvent = null;
  } else if (pendingEnding) {
    state.currentEnding = pendingEnding;
    state.phase = 'ending';
    pendingEnding = null;
  } else {
    state.phase = 'action';
  }
}

function onChooseEvent(choice: EventChoice) {
  const resultText = gameLoop.applyEventChoice(choice);
  syncState();
  state.currentEvent = null;

  if (resultText) {
    state.weekSummary = [resultText];
    state.phase = 'summary';
    pendingEvent = null;
    pendingEnding = null;
    const ending = gameLoop['endingManager'].checkEndings(gameLoop.gameState, gameLoop.getAge());
    if (ending) pendingEnding = ending;
  } else {
    const ending = gameLoop['endingManager'].checkEndings(gameLoop.gameState, gameLoop.getAge());
    if (ending) {
      state.currentEnding = ending;
      state.phase = 'ending';
    } else {
      state.phase = 'action';
    }
  }
}

const STAT_LABELS: Record<string, string> = {
  technique: '技术', band_chemistry: '默契', health: '健康',
  charm: '魅力', sanity: '精神', artistic_integrity: '艺术坚持',
  fame: '名声', intelligence: '智力',
};

function skillCheckLabel(stat: string): string {
  return STAT_LABELS[stat] ?? stat;
}

function skillCheckOdds(stat: string, difficulty: number): string {
  const val = state.stats[stat] ?? 0;
  const pct = Math.round(Math.min(90, Math.max(10, (val / (difficulty * 2)) * 100)));
  return `${pct}%`;
}

onMounted(() => syncState());
</script>

<style scoped>
.game-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #e8e8e8;
}

/* ── Background ── */
.scene-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: filter 0.6s;
  z-index: 0;
}

.scene-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(4, 4, 18, 0.55) 0%,
    rgba(4, 4, 18, 0.35) 40%,
    rgba(4, 4, 18, 0.85) 100%
  );
  z-index: 1;
}

.scene--event .scene-bg { filter: brightness(0.55) saturate(0.7); }
.scene--ending .scene-bg { filter: brightness(0.3) grayscale(0.6); }

/* ── Header ── */
.game-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1rem;
  background: rgba(4, 4, 18, 0.72);
  border-bottom: 1px solid rgba(180, 120, 255, 0.12);
  backdrop-filter: blur(8px);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.hdr-name { color: #e0b4ff; font-weight: 700; }
.hdr-week { color: #ccc; }
.hdr-date { color: #666; }
.hdr-sep  { color: #333; }

.hdr-save-btn {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0.3rem;
  color: #aaa;
  font-size: 0.7rem;
  padding: 0.15rem 0.55rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.hdr-save-btn:hover { background: rgba(255, 255, 255, 0.13); color: #eee; }

/* ── Content area ── */
.content-area {
  position: relative;
  z-index: 5;
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ── Character stage (action tab) ── */
.character-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-sprite {
  width: clamp(140px, 22vw, 220px);
  height: clamp(220px, 45vh, 360px);
  background: rgba(255, 255, 255, 0.04);
  border: 2px dashed rgba(255, 255, 255, 0.12);
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.sprite-label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 0.08em;
}

/* ── VN Box ── */
.vn-box {
  position: relative;
  z-index: 10;
  background: rgba(4, 4, 18, 0.92);
  border-top: 1px solid rgba(180, 120, 255, 0.2);
  backdrop-filter: blur(16px);
  padding: 0.7rem 1rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex-shrink: 0;
}

.vn-box--event {
  border-top-color: rgba(224, 64, 251, 0.35);
}

.vn-box--ending {
  border-top-color: rgba(224, 64, 251, 0.6);
}

/* ── Mini stat strip ── */
.stat-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.18rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  padding: 0.1rem 0.35rem;
  font-size: 0.68rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.stat-chip-icon { font-size: 0.65rem; line-height: 1; }
.stat-chip-val  { color: #bbb; font-variant-numeric: tabular-nums; }

.stat-chip--high { border-color: rgba(67, 233, 123, 0.25); }
.stat-chip--high .stat-chip-val { color: #80e8a0; }
.stat-chip--mid  { border-color: rgba(255, 210, 0, 0.2); }
.stat-chip--mid  .stat-chip-val { color: #ffd200; }
.stat-chip--low  { border-color: rgba(249, 83, 198, 0.25); }
.stat-chip--low  .stat-chip-val { color: #f580c0; }

.money-chip { border-color: rgba(255, 210, 0, 0.3); }
.money-chip .stat-chip-val { color: #ffd200; font-weight: 600; }

.debug-chip { border-color: rgba(255, 165, 0, 0.4); border-style: dashed; }
.debug-chip .stat-chip-val { color: #ffb347; }

/* ── Flavor text (action phase) ── */
.vn-narrative {
  font-size: 0.88rem;
  color: rgba(210, 195, 240, 0.75);
  font-style: italic;
  line-height: 1.65;
  margin: 0;
  letter-spacing: 0.02em;
}

/* ── Event ── */
.vn-event-text {
  font-size: 0.95rem;
  color: #f0eefc;
  line-height: 1.75;
  margin: 0;
}

.vn-event-narrative {
  font-size: 0.82rem;
  color: #aaa;
  font-style: italic;
  line-height: 1.5;
  margin: 0;
  border-left: 2px solid rgba(224, 64, 251, 0.3);
  padding-left: 0.65rem;
}

.vn-choices {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.vn-choice-btn {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: rgba(224, 64, 251, 0.06);
  border: 1px solid rgba(224, 64, 251, 0.28);
  border-radius: 0.4rem;
  color: #e8e4f8;
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  line-height: 1.4;
  font-family: inherit;
  /* Large touch target */
  min-height: 48px;
}

.vn-choice-btn:hover {
  background: rgba(224, 64, 251, 0.16);
  border-color: rgba(224, 64, 251, 0.6);
  transform: translateX(3px);
}

.vn-choice-btn:active {
  transform: scale(0.97) translateX(1px);
  background: rgba(224, 64, 251, 0.28);
  border-color: rgba(224, 64, 251, 0.8);
  transition: transform 0.05s, background 0.05s;
}

.choice-arrow {
  color: #e040fb;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.skill-check-tag {
  margin-left: auto;
  font-size: 0.72rem;
  color: #ffd54f;
  background: rgba(255, 213, 79, 0.12);
  border: 1px solid rgba(255, 213, 79, 0.3);
  border-radius: 0.25rem;
  padding: 0.1rem 0.4rem;
  flex-shrink: 0;
  white-space: nowrap;
}

.vn-choice-btn.has-skill-check {
  border-color: rgba(255, 213, 79, 0.35);
}

/* ── Summary ── */
.vn-summary-title {
  font-size: 0.72rem;
  color: #666;
  letter-spacing: 0.12em;
  margin: 0;
  text-align: center;
}

.vn-summary-lines {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.vn-summary-line {
  font-size: 0.88rem;
  color: #ccc;
  margin: 0;
  line-height: 1.55;
}

.vn-continue-btn {
  align-self: flex-end;
  background: rgba(224, 64, 251, 0.1);
  border: 1px solid rgba(224, 64, 251, 0.4);
  border-radius: 0.35rem;
  color: #e040fb;
  padding: 0.4rem 1rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.vn-continue-btn:hover { background: rgba(224, 64, 251, 0.22); }

/* ── Ending ── */
.ending-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #e040fb;
  text-shadow: 0 0 16px rgba(224, 64, 251, 0.5);
  margin: 0;
}

.ending-desc {
  font-size: 0.9rem;
  color: #ddd;
  line-height: 1.7;
  margin: 0;
}

.ending-epilogue {
  font-size: 0.78rem;
  color: #888;
  font-style: italic;
  line-height: 1.5;
  margin: 0;
  border-left: 2px solid rgba(224, 64, 251, 0.25);
  padding-left: 0.7rem;
}

.ending-restart {
  align-self: flex-start;
  background: rgba(224, 64, 251, 0.1);
  border: 1px solid rgba(224, 64, 251, 0.4);
  border-radius: 0.4rem;
  color: #e040fb;
  padding: 0.45rem 1rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.ending-restart:hover { background: rgba(224, 64, 251, 0.22); }

/* ── Mobile ── */
@media (max-width: 600px) {
  .game-header {
    font-size: 0.72rem;
    padding: 0.35rem 0.7rem;
    gap: 0.3rem;
  }

  .hdr-date { display: none; }
  .hdr-sep:last-of-type { display: none; }

  .vn-box {
    padding: 0.5rem 0.75rem 0.65rem;
    max-height: 60vh;
    overflow-y: auto;
    gap: 0.4rem;
  }

  .stat-strip {
    gap: 0.22rem;
    padding-bottom: 0.35rem;
  }

  .stat-chip {
    font-size: 0.58rem;
    padding: 0.07rem 0.25rem;
  }

  .stat-chip-icon { font-size: 0.6rem; }

  .vn-narrative {
    font-size: 0.82rem;
  }

  .vn-event-text {
    font-size: 0.88rem;
  }

  .vn-choice-btn {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
    min-height: 44px;
  }

  .ending-title {
    font-size: 1.1rem;
  }

  .ending-desc {
    font-size: 0.85rem;
  }

  .character-sprite {
    width: clamp(90px, 18vw, 140px);
    height: clamp(140px, 28vh, 200px);
  }
}
</style>
