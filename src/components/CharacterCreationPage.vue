<template>
  <div class="character-creation-page">
    <div class="form-container">
      <h1 class="title">{{ t('characterCreationPage.title') }}</h1>

      <!-- Gender Selection -->
      <div class="selection-group">
        <h2 class="subtitle">{{ t('characterCreationPage.gender') }}</h2>
        <div class="options">
          <label v-for="gender in genders" :key="gender" class="option-label" :class="{ selected: selectedGender === gender }">
            <input type="radio" :value="gender" v-model="selectedGender" name="gender">
            {{ t('characterCreationPage.' + gender.toLowerCase()) }}
          </label>
        </div>
      </div>

      <!-- Instrument Selection -->
      <div class="selection-group">
        <h2 class="subtitle">{{ t('characterCreationPage.instrument') }}</h2>
        <div class="options">
          <label v-for="instrument in instruments" :key="instrument" class="option-label" :class="{ selected: selectedInstrument === instrument }">
            <input type="radio" :value="instrument" v-model="selectedInstrument" name="instrument">
            {{ t('characterCreationPage.' + instrument.toLowerCase()) }}
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="action-button back-button" @click="goBack">{{ t('characterCreationPage.back') }}</button>
        <button class="action-button confirm-button" @click="confirmCharacter" :disabled="!isSelectionComplete">{{ t('characterCreationPage.confirm') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits(['character-created', 'back']);

const genders = ref(['Male', 'Female']);
const instruments = ref(['Guitar', 'Bass', 'Keyboard', 'Vocal', 'Drum']);

const selectedGender = ref(null);
const selectedInstrument = ref(null);

const isSelectionComplete = computed(() => selectedGender.value && selectedInstrument.value);

function confirmCharacter() {
  if (isSelectionComplete.value) {
    emit('character-created', {
      gender: selectedGender.value,
      instrument: selectedInstrument.value,
    });
  }
}

function goBack() {
  emit('back');
}
</script>

<style scoped>
.character-creation-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  text-align: center;
}

.form-container {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 3rem;
  border-radius: 1rem;
  width: 80%;
  max-width: 600px;
}

.title {
  font-size: 3rem;
  margin-bottom: 2rem;
}

.subtitle {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #a0a0a0;
}

.selection-group {
  margin-bottom: 2rem;
}

.options {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.option-label {
  padding: 0.8rem 1.5rem;
  border: 2px solid #4CAF50;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-size: 1.2rem;
}

.option-label:hover {
  background-color: #45a049;
}

.option-label.selected {
  background-color: #4CAF50;
  color: white;
}

/* Hide the actual radio button */
.option-label input[type="radio"] {
  display: none;
}

.actions {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.action-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button {
  background-color: #f44336;
  color: white;
}

.back-button:hover {
  background-color: #da190b;
}

.confirm-button {
  background-color: #4CAF50;
  color: white;
}

.confirm-button:hover {
  background-color: #45a049;
}

.confirm-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}
</style>
