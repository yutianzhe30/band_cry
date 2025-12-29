<template>
  <div class="main-game">
    <h1>Main Game</h1>
    <div v-if="character">
      <h2>Character Details:</h2>
      <p><strong>Gender:</strong> {{ character.gender }}</p>
      <p><strong>Instrument:</strong> {{ character.instrument }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  character: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.main-game {
  color: white;
  padding: 2rem;
}
</style>
