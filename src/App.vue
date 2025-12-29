<template>
  <div id="app">
    <StartPage v-if="!gameStarted" @start-game="startGame" :background-image="'/vite.svg'" />
    <MainGame v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StartPage from './components/StartPage.vue';
//import MainGame from './components/MainGame.vue';

const gameStarted = ref(false);

function startGame() {
  gameStarted.value = true;
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
