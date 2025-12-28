<script setup lang="ts">
import { useGame } from '../engine/useGame';

const { stats, currentEvent, handleChoice, gameLog } = useGame();
</script>

<template>
  <div class="game-container">
    <!-- Header / Stats Bar -->
    <header class="stats-bar">
      <div class="stat-item">🎸 技术: {{ stats.technique }}</div>
      <div class="stat-item">🌟 名气: {{ stats.fame }}</div>
      <div class="stat-item">💰 金钱: {{ stats.money }}</div>
      <div class="stat-item">🧠 压力: {{ stats.stress }}</div>
      <div class="stat-item">🤝 默契: {{ stats.chemistry }}</div>
    </header>

    <!-- Main Event Area -->
    <main class="event-stage">
      <div class="event-card" v-if="currentEvent">
        <h2>{{ currentEvent.title }}</h2>
        <p class="description">{{ currentEvent.description }}</p>
        
        <div class="choices">
          <button 
            v-for="(choice, index) in currentEvent.choices" 
            :key="index"
            @click="handleChoice(choice)"
            class="choice-btn"
          >
            {{ choice.text }}
          </button>
        </div>
      </div>
      <div v-else class="loading">
        Loading...
      </div>
    </main>

    <!-- Log Panel -->
    <aside class="log-panel">
      <h3>历史记录</h3>
      <ul>
        <li v-for="(log, index) in gameLog" :key="index">{{ log }}</li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.game-container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Courier New', Courier, monospace;
  background-color: #1a1a1a;
  color: #eee;
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  background-color: #333;
  border-bottom: 2px solid #555;
}

.event-stage {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.event-card {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #444;
  width: 100%;
}

.description {
  margin: 1.5rem 0;
  line-height: 1.6;
  font-size: 1.1rem;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.choice-btn {
  padding: 1rem;
  background: #444;
  border: none;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.choice-btn:hover {
  background: #555;
}

.log-panel {
  height: 150px;
  overflow-y: auto;
  background: #111;
  padding: 1rem;
  border-top: 1px solid #333;
  font-size: 0.9rem;
  color: #888;
}
</style>