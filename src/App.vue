<template>
  <div id="app">
    <StartPage
      v-if="currentPage === 'start'"
      @start-game="startGame"
      @show-introduction="showIntroduction"
      @show-settings="showSettings"
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
    <MainGame v-else-if="currentPage === 'game'" :character="playerCharacter" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StartPage from './components/StartPage.vue';
import IntroductionPage from './components/IntroductionPage.vue';
import SettingsPage from './components/SettingsPage.vue';
import CharacterCreationPage from './components/CharacterCreationPage.vue';
import MainGame from './components/MainGame.vue';
import probeRoomImage from './assets/images/ProbeRoom1.png';

const currentPage = ref('start');
const playerCharacter = ref(null);

function startGame() {
  currentPage.value = 'character-creation';
}

function characterCreated(character) {
  playerCharacter.value = character;
  currentPage.value = 'game';
}

function showIntroduction() {
  currentPage.value = 'introduction';
}

function showSettings() {
  currentPage.value = 'settings';
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
