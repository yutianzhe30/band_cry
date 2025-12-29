<template>
  <div class="character-creation-page">
    <div class="character-preview">
      <div class="preview-content">
        <img v-if="currentCharacter.image" :src="currentCharacter.image" alt="Character Preview" class="character-image">
        <div v-else class="image-placeholder"></div>
        <p class="story">{{ currentCharacter.story }}</p>
      </div>
    </div>

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
        <div class="options-grid">
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

const currentCharacter = computed(() => {
  if (!selectedGender.value || !selectedInstrument.value) {
    return {
      story: t('characterStories.default'),
      image: null,
    };
  }
  const key = `${selectedGender.value}-${selectedInstrument.value}`;
  const story = t(`characterStories.${key}`, t('characterStories.default'));
  const imageName = `character_${selectedGender.value.toLowerCase()}_${selectedInstrument.value.toLowerCase()}.png`;
  
  let imageUrl = null;
  try {
    // Vite requires this specific pattern for dynamic asset imports
    imageUrl = new URL(`../assets/images/characters/${imageName}`, import.meta.url).href;
  } catch (e) {
    console.error(`Image not found: ${imageName}`);
    imageUrl = null;
  }

  return {
    story,
    image: imageUrl,
  };
});

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
  height: 100vh;
  width: 100%;
  color: white;
  text-align: center;
}

.character-preview {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.preview-content {
  max-width: 400px;
}

.character-image {
  width: 100%;
  height: auto;
  border-radius: 1rem;
  margin-bottom: 1rem;
  border: 2px solid #4CAF50;
}

.image-placeholder {
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  border-radius: 1rem;
  margin-bottom: 1rem;
  border: 2px dashed #555;
  background-color: rgba(255, 255, 255, 0.05);
}

.story {
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
  color: #ccc;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
  background-color: rgba(10, 10, 10, 0.7);
}

.title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #a0a0a0;
}

.selection-group {
  margin-bottom: 1.5rem;
}

.options, .options-grid {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.option-label {
  padding: 0.7rem 1.2rem;
  border: 2px solid #4CAF50;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-size: 1rem;
}

.option-label:hover {
  background-color: #45a049;
}

.option-label.selected {
  background-color: #4CAF50;
  color: white;
}

.option-label input[type="radio"] {
  display: none;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.action-button {
  padding: 0.8rem 1.8rem;
  font-size: 1.1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button {
  background-color: #f44336;
  color: white;
}

.confirm-button {
  background-color: #4CAF50;
  color: white;
}
</style>
