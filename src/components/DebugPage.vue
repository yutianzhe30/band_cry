<template>
  <div class="debug-page">
    <h1>Engine Debug Panel</h1>

    <!-- Game State Display -->
    <div class="state-section">
      <h2>Game State</h2>
      <p><strong>Current Date:</strong> {{ gameState?.currentDate.toLocaleDateString() }}</p>
      <p><strong>Age:</strong> {{ age }}</p>
      <p><strong>Action Points:</strong> {{ gameState?.actionPoints }}</p>
    </div>

    <!-- Stats Control -->
    <div class="state-section">
      <h2>Player Stats</h2>
      <div v-if="gameState" class="stats-grid">
        <div v-for="[statId, statValue] in Array.from(gameState.player.stats.entries())" :key="statId" class="stat-item">
          <span>{{ statSystem.getStatDefinition(statId)?.name || statId }}: <strong>{{ statValue.toFixed(0) }}</strong></span>
          <div class="stat-controls">
            <button @click="modifyStat(statId, -10)">-10</button>
            <button @click="modifyStat(statId, -1)">-</button>
            <button @click="modifyStat(statId, 1)">+</button>
            <button @click="modifyStat(statId, 10)">+10</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Control -->
    <div class="actions-section">
      <h2>Perform Action (AP Cost: 1)</h2>
      <div class="actions-grid">
        <button v-for="action in availableActions" :key="action.id" @click="performAction(action.id)" :disabled="(gameState?.actionPoints || 0) < action.cost.ap">
          {{ action.name }}
        </button>
      </div>
       <button @click="endTurn" class="end-turn-button">Force End Week</button>
    </div>
    
    <!-- Manual Event Trigger -->
    <div class="actions-section">
        <h2>Manual Event Trigger</h2>
        <div class="event-trigger-grid">
          <select v-model="selectedEventId">
            <option disabled value="">Select an event</option>
            <option v-for="event in allEvents" :key="event.id" :value="event.id">
              {{ event.id }}
            </option>
          </select>
          <button @click="triggerSelectedEvent" :disabled="!selectedEventId">Trigger Event</button>
        </div>
    </div>

    <!-- Event Log -->
    <div class="log-section">
      <h2>Event Log</h2>
      <pre>{{ eventLog }}</pre>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { GameLoop } from '../engine/GameLoop';
import { StatSystem } from '../engine/StatSystem';
import { ActionSystem } from '../engine/ActionSystem';
import { EventManager } from '../engine/EventManager';

let gameLoop;
const statSystem = StatSystem.getInstance();
const actionSystem = ActionSystem.getInstance();
const eventManager = EventManager.getInstance();

const gameState = ref(null);
const eventLog = ref('No events yet.');
const availableActions = ref([]);
const allEvents = ref([]);
const selectedEventId = ref('');

onMounted(() => {
  gameLoop = new GameLoop({ name: 'Debug Player', gender: 'Male', role: 'Guitar' });
  updateGameStateRef();
  availableActions.value = gameLoop.getAvailableActions();
  allEvents.value = eventManager.allEvents;
});

const age = computed(() => {
  if (!gameState.value) return 0;
  const birthYear = new Date().getFullYear();
  return gameState.value.currentDate.getFullYear() - birthYear;
});

function updateGameStateRef() {
  gameState.value = { ...gameLoop.gameState };
}

function modifyStat(statId, value) {
  gameLoop.applyEffects([{ stat: statId, op: 'add', value: value }]);
  updateGameStateRef();
}

function performAction(actionId) {
  const { event, ending } = gameLoop.performAction(actionId);
  logResult(event, ending);
  updateGameStateRef();
}

function endTurn() {
  const { event, ending } = gameLoop.endTurn();
  logResult(event, ending);
  updateGameStateRef();
}

function triggerSelectedEvent() {
    if (!selectedEventId.value) return;
    const event = eventManager.allEvents.find(e => e.id === selectedEventId.value);
    if (event) {
        logResult(event, null);
    }
}

function logResult(event, ending) {
  if (ending) {
    eventLog.value = `--- GAME OVER ---
Ending: ${ending.title}
${ending.description}`;
  } else if (event) {
    eventLog.value = `Event Triggered: ${event.id}
${event.description}
Choices: 
${event.choices.map(c => `- ${c.text}`).join('\n')}`;
    // Auto-pick the first choice for debugging
    gameLoop.applyEffects(event.choices[0].effects);
    eventLog.value += `\n\nAuto-selected first choice.`;
  } else {
    eventLog.value = 'Turn ended. No new event or ending.';
  }
}

</script>

<style scoped>
.debug-page {
  font-family: monospace;
  color: #eee;
  background-color: #1a1a1a;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
h1, h2 {
  color: #4CAF50;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
}
.state-section, .actions-section, .log-section {
  background-color: #2a2a2a;
  padding: 1rem;
  border-radius: 8px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0.5rem;
  border-radius: 4px;
}
.stat-controls button {
  margin-left: 0.5rem;
}
.actions-grid, .event-trigger-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
select {
    padding: 0.5rem;
    background-color: #333;
    color: white;
    border: 1px solid #555;
    border-radius: 4px;
}
button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
button:disabled {
  background-color: #555;
  cursor: not-allowed;
}
.end-turn-button {
  margin-top: 1rem;
  background-color: #f44336;
}
.end-turn-button:hover {
  background-color: #d32f2f;
}
.log-section pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>