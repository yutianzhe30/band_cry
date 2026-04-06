<template>
  <div id="app">
    <StartPage
      v-if="currentPage === 'start'"
      @start-game="startGame"
      @continue-game="continueGame"
      @show-introduction="showIntroduction"
      @show-settings="showSettings"
      @show-debug="showDebug"
      :background-image="probeRoomImage"
    />
    <IntroductionPage v-else-if="currentPage === 'introduction'" @back="goBackToStart" />
    <SettingsPage v-else-if="currentPage === 'settings'" @back="goBackToStart" />
    <CharacterCreationPage
      v-else-if="currentPage === 'character-creation'"
      @character-created="characterCreated"
      @back="goBackToStart"
      :background-image="probeRoomImage"
    />
    <MainGame v-else-if="currentPage === 'game'" :character="playerCharacter" :load-from-save="loadFromSave" @restart="goBackToStart" />
    <DebugPage v-else-if="currentPage === 'debug'" @back="goBackToStart" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StartPage from './components/StartPage.vue';
import IntroductionPage from './components/IntroductionPage.vue';
import SettingsPage from './components/SettingsPage.vue';
import CharacterCreationPage from './components/CharacterCreationPage.vue';
import MainGame from './components/MainGame.vue';
import DebugPage from './components/DebugPage.vue';
import { GameLoop } from './engine/GameLoop';
import probeRoomImage from './assets/images/ProbeRoom1.png';

const currentPage = ref('start');
const playerCharacter = ref(null);
const loadFromSave = ref(false); // false | true | slot string

// ── URL scene routing (dev shortcut) ─────────────────────
const urlParams = new URLSearchParams(window.location.search);
const sceneParam = urlParams.get('scene');
const loadParam = urlParams.get('load'); // optional slot name

if (sceneParam) {
  switch (sceneParam) {
    case 'debug':        currentPage.value = 'debug'; break;
    case 'character':    currentPage.value = 'character-creation'; break;
    case 'introduction': currentPage.value = 'introduction'; break;
    case 'settings':     currentPage.value = 'settings'; break;
    case 'game':
      playerCharacter.value = { name: '调试角色', gender: 'Male', instrument: 'Guitar' };
      loadFromSave.value = loadParam ?? false;
      currentPage.value = 'game';
      break;
  }
}

function startGame() {
  loadFromSave.value = false;
  currentPage.value = 'character-creation';
}

function continueGame(slot) {
  loadFromSave.value = slot ?? 'autosave';
  playerCharacter.value = { name: '', gender: 'Male', instrument: 'Guitar' }; // placeholder; MainGame loads from save
  currentPage.value = 'game';
}

function characterCreated(character) {
  playerCharacter.value = character;
  loadFromSave.value = false;
  currentPage.value = 'game';
}

function showIntroduction() {
  currentPage.value = 'introduction';
}

function showSettings() {
  currentPage.value = 'settings';
}

function showDebug() {
  currentPage.value = 'debug';
}

function goBackToStart() {
  currentPage.value = 'start';
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: black;
  height: 100vh;
}
</style>
