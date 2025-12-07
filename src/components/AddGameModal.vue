<template>
  <div>
    <Button label="Add Game" icon="pi pi-plus" class="w-full" @click="openModal" />

    <Dialog v-model:visible="visible" header="Add a Game" :style="{ width: 'min(30rem, 90vw)' }" :modal="true"
      class="p-fluid">
      <div class="dialog-content">
        <div class="field-checkbox mb-4">
          <Checkbox inputId="nonsteam" v-model="isCustom" :binary="true" @update:modelValue="onToggleNonSteam" />
          <label for="nonsteam">Add non-Steam / custom game</label>
        </div>

        <div class="field mb-4">
          <template v-if="!isCustom">
            <span class="p-input-icon-left w-full">
              <IconField>
                <InputIcon class="pi pi-search" />
                <AutoComplete v-model="searchQuery" :suggestions="results" @complete="onComplete" optionLabel="name"
                  placeholder="Search for a Steam game..." class="w-full" :loading="loading"
                  @item-select="selectGame" />
              </IconField>

            </span>
          </template>
          <template v-else>
            <InputText v-model="manualName" placeholder="Enter game name" class="w-full" />
          </template>
        </div>

        <div class="image-preview-container">
          <div class="image-wrapper">
            <img v-if="selectedGame && !isCustom" :src="getGameImage(selectedGame.appid)" :alt="selectedGame.name"
              class="game-image" />
            <img v-else :src="isCustom ? placeholderCustom : placeholderDefault" alt="Game placeholder"
              class="game-image placeholder" />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="closeModal" />
        <Button label="Add Game" icon="pi pi-check" :disabled="!canAdd" @click="handleAddGame" />
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
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import placeholderDefault from '../assets/placeholder-460x215.svg'
import placeholderCustom from '../assets/placeholder_custom-game.svg'

const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const debounceTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const selectedGame = ref<any | null>(null)
const isCustom = ref(false)
const manualName = ref('')

const canAdd = computed(() => {
  return isCustom.value ? manualName.value.trim().length > 0 : !!selectedGame.value
})

const emit = defineEmits<{
  (e: 'gameSelected', game: any): void
  (e: 'added'): void
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
    emit('added')
  }
  closeModal()
}

function getGameImage(appid: number) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`
}
</script>

<style scoped>
.dialog-content {
  padding-top: 0.5rem;
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
}

.image-preview-container {
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 12rem;
}

.image-wrapper {
  width: 100%;
  max-width: 20rem;
  aspect-ratio: 460 / 215;
  border-radius: 0.375rem;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  background: var(--bg-secondary);
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.game-image.placeholder {
  opacity: 0.8;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.w-full {
  width: 100%;
}
</style>
