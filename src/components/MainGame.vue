<template>
  <div class="game-root" :class="`scene--${currentScene}`">
    <!-- Background -->
    <div class="scene-bg" :style="bgStyle"></div>
    <div class="scene-overlay"></div>

    <!-- Header bar -->
    <header class="game-header">
      <span class="hdr-name">{{ state.playerName }}</span>
      <span class="hdr-sep">·</span>
      <span class="hdr-week">第 {{ state.week }} 周</span>
      <span class="hdr-sep">·</span>
      <span class="hdr-age">{{ state.age }} 岁</span>
      <span class="hdr-sep">·</span>
      <span class="hdr-date">{{ formattedDate }}</span>
    </header>

    <!-- Main area -->
    <div class="game-body">
      <!-- Left: Stats -->
      <aside class="sidebar">
        <StatBar
          :stats="state.stats"
          :stat-defs="statDefs"
          :player-name="state.playerName"
          :player-role="state.playerRole"
        />
        <LogPanel :entries="state.log" />
      </aside>

      <!-- Center: scene -->
      <main class="scene-area">
        <transition name="fade">
          <div v-if="state.phase === 'summary'" class="summary-overlay">
            <div class="summary-box">
              <p class="summary-title">── 本周结算 ──</p>
              <p v-for="(line, i) in state.weekSummary" :key="i" class="summary-line">{{ line }}</p>
              <button class="summary-continue" @click="dismissSummary">继续 →</button>
            </div>
          </div>
        </transition>
      </main>
    </div>

    <!-- VN dialog / action panel at the bottom -->
    <footer class="dialog-zone">
      <transition name="slide-up" mode="out-in">

        <!-- ACTION phase -->
        <ActionPanel
          v-if="state.phase === 'action'"
          key="action"
          :actions="availableActions"
          :current-a-p="state.ap"
          :week="state.week"
          @perform="onPerformAction"
          @end-week="onEndWeek"
        />

        <!-- EVENT phase -->
        <EventCard
          v-else-if="state.phase === 'event' && state.currentEvent"
          key="event"
          :event="state.currentEvent"
          :game-state="rawGameState"
          :age="state.age"
          @choose="onChooseEvent"
        />

        <!-- ENDING phase -->
        <div v-else-if="state.phase === 'ending' && state.currentEnding" key="ending" class="ending-panel">
          <p class="ending-title">{{ state.currentEnding.title }}</p>
          <p class="ending-desc">{{ state.currentEnding.description }}</p>
          <p v-if="state.currentEnding.epilogue" class="ending-epilogue">{{ state.currentEnding.epilogue }}</p>
          <button class="ending-restart" @click="$emit('restart')">重新开始</button>
        </div>

      </transition>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { GameLoop } from '../engine/GameLoop';
import { StatSystem } from '../engine/StatSystem';
import type { GameEvent, GameEnding, EventChoice, LogEntry, GameState, GameAction } from '../types/GameTypes';
import StatBar from './StatBar.vue';
import EventCard from './EventCard.vue';
import LogPanel from './LogPanel.vue';
import ActionPanel from './ActionPanel.vue';
import probeRoomBg from '../assets/images/ProbeRoom1.png';

const props = defineProps<{
  character: { name: string; gender: 'Male' | 'Female'; instrument: string };
}>();

defineEmits<{ restart: [] }>();

// ── Engine ────────────────────────────────────────────────
const gameLoop = new GameLoop({
  name: props.character.name || '无名乐手',
  gender: props.character.gender,
  role: props.character.instrument as any,
});

const statSystem = StatSystem.getInstance();
const statDefs = statSystem.statDefinitions;

// ── Reactive UI state ─────────────────────────────────────
interface UIState {
  playerName: string;
  playerRole: string;
  week: number;
  age: number;
  ap: number;
  stats: Record<string, number>;
  log: LogEntry[];
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
  phase: 'action',
  currentEvent: null,
  currentEnding: null,
  weekSummary: [],
  currentDate: new Date(),
});

// Provide raw gameState to EventCard for requirement checks
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
  state.currentDate = new Date(gs.currentDate);
}

const availableActions = computed<GameAction[]>(() => gameLoop.getAvailableActions());

const formattedDate = computed(() => {
  const d = state.currentDate;
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
});

const currentScene = computed(() => {
  if (state.phase === 'ending') return 'ending';
  if (state.phase === 'event') return 'event';
  return 'default';
});

const bgStyle = computed(() => ({
  backgroundImage: `url(${probeRoomBg})`,
}));

// ── Handlers ──────────────────────────────────────────────
function onPerformAction(actionId: string) {
  gameLoop.performAction(actionId);
  syncState();
  // If AP hits 0 automatically end the week
  if (gameLoop.gameState.actionPoints === 0) {
    onEndWeek();
  }
}

function onEndWeek() {
  const result = gameLoop.endTurn();
  syncState();

  if (result.summary.length > 0) {
    state.weekSummary = result.summary;
    state.phase = 'summary';
    // Store event/ending to show after summary
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
  gameLoop.applyEventChoice(choice);
  syncState();
  state.currentEvent = null;

  // Show the choice result as a brief summary if it has result_text
  if (choice.result_text) {
    state.weekSummary = [choice.result_text];
    state.phase = 'summary';
    pendingEvent = null;
    pendingEnding = null;

    // After dismissing the result, check for ending
    const ending = gameLoop['endingManager'].checkEndings(gameLoop.gameState, gameLoop.getAge());
    if (ending) pendingEnding = ending;
  } else {
    // Check for ending after choice
    const ending = gameLoop['endingManager'].checkEndings(gameLoop.gameState, gameLoop.getAge());
    if (ending) {
      state.currentEnding = ending;
      state.phase = 'ending';
    } else {
      state.phase = 'action';
    }
  }
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
  background: linear-gradient(180deg, rgba(4,4,18,0.7) 0%, rgba(4,4,18,0.55) 50%, rgba(4,4,18,0.92) 100%);
  z-index: 1;
}

.scene--event .scene-bg { filter: brightness(0.6) saturate(0.7); }
.scene--ending .scene-bg { filter: brightness(0.35) grayscale(0.5); }

/* ── Header ── */
.game-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 1.2rem;
  background: rgba(4, 4, 18, 0.75);
  border-bottom: 1px solid rgba(180, 120, 255, 0.15);
  backdrop-filter: blur(8px);
  font-size: 0.82rem;
}

.hdr-name { color: #e0b4ff; font-weight: 700; }
.hdr-week { color: #ccc; }
.hdr-age  { color: #ffd200; }
.hdr-date { color: #777; }
.hdr-sep  { color: #444; }

/* ── Body ── */
.game-body {
  position: relative;
  z-index: 5;
  display: flex;
  flex: 1;
  gap: 0.8rem;
  padding: 0.8rem;
  overflow: hidden;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 180px;
  flex-shrink: 0;
}

.scene-area {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* ── Summary overlay ── */
.summary-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 4, 18, 0.7);
  border-radius: 0.6rem;
}

.summary-box {
  background: rgba(10, 10, 35, 0.95);
  border: 1px solid rgba(180, 120, 255, 0.3);
  border-radius: 0.6rem;
  padding: 1.2rem 1.8rem;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
}

.summary-title {
  font-size: 0.75rem;
  color: #666;
  letter-spacing: 0.12em;
  margin: 0;
}

.summary-line {
  font-size: 0.88rem;
  color: #ccc;
  margin: 0;
  line-height: 1.5;
}

.summary-continue {
  margin-top: 0.6rem;
  background: rgba(224, 64, 251, 0.12);
  border: 1px solid rgba(224, 64, 251, 0.4);
  border-radius: 0.35rem;
  color: #e040fb;
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s;
}
.summary-continue:hover { background: rgba(224, 64, 251, 0.22); }

/* ── Dialog zone ── */
.dialog-zone {
  position: relative;
  z-index: 10;
  background: rgba(4, 4, 18, 0.9);
  border-top: 1px solid rgba(180, 120, 255, 0.2);
  backdrop-filter: blur(12px);
  padding: 0.9rem 1.2rem;
  min-height: 180px;
  max-height: 260px;
}

/* ── Ending panel ── */
.ending-panel {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  height: 100%;
}

.ending-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e040fb;
  text-shadow: 0 0 16px rgba(224, 64, 251, 0.5);
  margin: 0;
}

.ending-desc {
  font-size: 0.9rem;
  color: #ddd;
  line-height: 1.65;
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
  margin-top: auto;
  align-self: flex-start;
  background: rgba(224, 64, 251, 0.1);
  border: 1px solid rgba(224, 64, 251, 0.4);
  border-radius: 0.4rem;
  color: #e040fb;
  padding: 0.45rem 1rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
}
.ending-restart:hover { background: rgba(224, 64, 251, 0.22); }

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.slide-up-enter-active,
.slide-up-leave-active { transition: opacity 0.2s, transform 0.2s; }
.slide-up-enter-from { opacity: 0; transform: translateY(12px); }
.slide-up-leave-to   { opacity: 0; transform: translateY(-6px); }
</style>
