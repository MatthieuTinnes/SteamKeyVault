<template>
  <div>
    <Button :label="t('games.addGame')" icon="pi pi-plus" class="w-full" @click="openModal" />

    <Dialog v-model:visible="visible" :header="t('games.addGameHeader')" :style="{ width: 'min(32rem, 95vw)' }" :modal="true"
      class="add-game-modal">
      <div class="dialog-content">
        
        <div class="field-checkbox mb-4">
          <Checkbox inputId="nonsteam" v-model="isCustom" :binary="true" @update:modelValue="onToggleNonSteam" />
          <label for="nonsteam">{{ t('games.addCustomLabel') }}</label>
        </div>

        <div class="field mb-4">
          <template v-if="!isCustom">
            <span class="w-full">
              <AutoComplete 
                v-model="searchQuery" 
                :suggestions="results" 
                @complete="onComplete" 
                optionLabel="name"
                :placeholder="t('games.searchSteamPlaceholder')" 
                class="w-full" 
                :loading="loading"
                @item-select="selectGame"
                inputClass="w-full"
              >
                <template #option="slotProps">
                  <div class="game-option">
                    <img :src="`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${slotProps.option.appid}/header.jpg`" :alt="slotProps.option.name" class="option-image" />
                    <span>{{ slotProps.option.name }}</span>
                  </div>
                </template>
              </AutoComplete>
            </span>
          </template>
          <template v-else>
            <InputText v-model="manualName" :placeholder="t('games.manualNamePlaceholder')" class="w-full" />
          </template>
        </div>

        <div v-if="selectedGame || isCustom" class="selected-preview">
          <div class="preview-label">{{ t('games.preview') }}</div>
          <div class="preview-card">
            <img v-if="selectedGame && !isCustom" :src="getGameImage(selectedGame.appid)" :alt="selectedGame.name" class="preview-image" />
            <img v-else :src="isCustom ? placeholderCustom : placeholderDefault" :alt="t('games.placeholderAlt')" class="preview-image placeholder" />
            
            <div class="preview-details">
              <div class="preview-name">{{ isCustom ? (manualName || t('games.newCustomGame')) : selectedGame.name }}</div>
              <div class="preview-id" v-if="!isCustom && selectedGame">{{ t('games.appId', { id: selectedGame.appid }) }}</div>
              <div class="preview-id" v-else>{{ t('games.customGame') }}</div>
            </div>
          </div>
        </div>

      </div>

      <template #footer>
        <Button :label="t('common.cancel')" icon="pi pi-times" text @click="closeModal" />
        <Button :label="t('games.addGame')" icon="pi pi-check" :disabled="!canAdd" @click="handleAddGame" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, computed } from 'vue'
import { searchSteamGames, addUserGame } from '../api/games'
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import AutoComplete from 'primevue/autocomplete';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import placeholderDefault from '../assets/placeholder-460x215.svg'
import placeholderCustom from '../assets/placeholder_custom-game.svg'
import { useI18n } from 'vue-i18n'

const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const debounceTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const selectedGame = ref<any | null>(null)
const isCustom = ref(false)
const manualName = ref('')
const { t } = useI18n()

const canAdd = computed(() => {
  return isCustom.value ? manualName.value.trim().length > 0 : !!selectedGame.value
})

const emit = defineEmits<{
  (e: 'gameSelected', game: any): void
  (e: 'added', newGame: any): void
}>()

const visible = ref(false)

function openModal() {
  visible.value = true
  isCustom.value = false
  manualName.value = ''
  selectedGame.value = null
  searchQuery.value = ''
  results.value = []
}

function closeModal() {
  selectedGame.value = null
  isCustom.value = false
  manualName.value = ''
  searchQuery.value = ''
  results.value = []
  visible.value = false
}

function onComplete(event: { query: string }) {
  if (debounceTimeout.value) clearTimeout(debounceTimeout.value)
  const query = event.query.trim()
  if (!query) {
    results.value = []
    return
  }
  loading.value = true
  debounceTimeout.value = setTimeout(async () => {
    try {
      results.value = await searchSteamGames(query)
    } catch (e) {
      results.value = []
    } finally {
      loading.value = false
    }
  }, 350)
}

function selectGame(event: { value: any }) {
  selectedGame.value = event.value
}

function onToggleNonSteam(val: boolean) {
  isCustom.value = !!val
  if (isCustom.value) {
    selectedGame.value = null
    searchQuery.value = ''
    results.value = []
  } else {
    manualName.value = ''
  }
}

async function handleAddGame() {
  let nameToSend = ''
  let appid: number | undefined = undefined
  if (isCustom.value) {
    if (!manualName.value) return
    nameToSend = manualName.value.trim()
  } else {
    if (!selectedGame.value) return
    nameToSend = selectedGame.value.name
    appid = selectedGame.value.appid
  }

  const response = await addUserGame({ name: nameToSend, steamappid: appid })
  if (response && response.status === 201) {
    emit('added', response.data)
  }
  closeModal()
}

function getGameImage(appid: number) {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`
}
</script>

<style scoped>
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-checkbox label {
  margin-bottom: 0;
  cursor: pointer;
  color: var(--text-primary);
  font-weight: 500;
}

.field {
  display: flex;
  flex-direction: column;
}

.w-full {
  width: 100%;
}

.game-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-image {
  width: 60px;
  height: auto;
  border-radius: 0.25rem;
}

.selected-preview {
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.preview-card {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.preview-image {
  width: 120px;
  height: auto;
  border-radius: 0.25rem;
  box-shadow: var(--shadow-sm);
}

.preview-image.placeholder {
  opacity: 0.8;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.preview-id {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-family: monospace;
}

/* PrimeVue overrides */
:deep(.p-autocomplete) {
  width: 100%;
}
:deep(.p-autocomplete-input) {
  width: 100%;
}
</style>
