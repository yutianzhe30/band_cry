<template>
  <div class="start-page" :style="pageStyle">
    <audio v-if="bgm" :src="bgm" autoplay loop></audio>
    <div class="title-container">
      <h1 class="title">Band Cry</h1>
      <button class="start-button" @click="startGame">Start Game</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  backgroundImage: {
    type: String,
    default: '',
  },
  bgm: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['start-game']);

const pageStyle = computed(() => ({
  backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : 'none',
}));

function startGame() {
  emit('start-game');
}
</script>

<style scoped>
.start-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-size: cover;
  background-position: center;
  text-align: center;
}

.title-container {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2rem;
  border-radius: 1rem;
}

.title {
  font-size: 5rem;
  color: white;
  text-shadow: 2px 2px 4px #000000;
}

.start-button {
  margin-top: 2rem;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  border-radius: 0.5rem;
  border: none;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-button:hover {
  background-color: #45a049;
}
</style>
