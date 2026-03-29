<template>
  <div class="event-card">
    <div class="event-header">
      <span class="event-tag">【事件】</span>
    </div>
    <p class="event-description">{{ event.description }}</p>
    <p v-if="event.narrative" class="event-narrative">{{ event.narrative }}</p>

    <div class="choices">
      <button
        v-for="(choice, i) in availableChoices"
        :key="i"
        class="choice-btn"
        @click="$emit('choose', choice)"
      >
        <span class="choice-index">{{ choiceLabel(i) }}</span>
        {{ choice.text }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameEvent, EventChoice, GameState } from '../types/GameTypes';
import { checkRequirements } from '../engine/TriggerEvaluator';

const props = defineProps<{
  event: GameEvent;
  gameState: GameState;
  age: number;
}>();

defineEmits<{ choose: [choice: EventChoice] }>();

const labels = ['A', 'B', 'C', 'D'];
function choiceLabel(i: number): string { return labels[i] ?? String(i + 1); }

const availableChoices = computed(() =>
  props.event.choices.filter(c =>
    !c.requirements || checkRequirements(c.requirements, props.gameState, props.age)
  )
);
</script>

<style scoped>
.event-card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  height: 100%;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-tag {
  font-size: 0.72rem;
  color: #e040fb;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-shadow: 0 0 8px rgba(224, 64, 251, 0.6);
}

.event-description {
  font-size: 1rem;
  line-height: 1.65;
  color: #f0f0f0;
  margin: 0;
}

.event-narrative {
  font-size: 0.85rem;
  color: #aaa;
  font-style: italic;
  line-height: 1.5;
  margin: 0;
  border-left: 2px solid rgba(224, 64, 251, 0.3);
  padding-left: 0.7rem;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: auto;
}

.choice-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(224, 64, 251, 0.07);
  border: 1px solid rgba(224, 64, 251, 0.35);
  border-radius: 0.4rem;
  color: #e8e8e8;
  padding: 0.55rem 0.9rem;
  font-size: 0.88rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.1s;
  line-height: 1.4;
}

.choice-btn:hover {
  background: rgba(224, 64, 251, 0.18);
  border-color: #e040fb;
  transform: translateX(2px);
}

.choice-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  background: rgba(224, 64, 251, 0.3);
  border-radius: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #e040fb;
  flex-shrink: 0;
}
</style>
