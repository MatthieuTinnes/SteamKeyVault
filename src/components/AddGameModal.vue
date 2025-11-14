<template>
  <div>
  <Button label="Add Game" icon="pi pi-plus" class="p-button-sm w-full" @click="openModal" />
    <Dialog v-model:visible="visible" header="Add a Game" :style="{ width: '400px' }" :closable="true">
      <div class="p-fluid">
        <div class="option-row">
          <Checkbox inputId="nonsteam" v-model="isCustom" :binary="true" @update:modelValue="onToggleNonSteam" />
          <label class="option-label" :for="'nonsteam'">Add non-Steam / custom game</label>
        </div>
        <template v-if="!isCustom">
          <AutoComplete
            v-model="searchQuery"
            :suggestions="results"
            @complete="onComplete"
            optionLabel="name"
            type="text"
            placeholder="Search for a Steam game..."
            class="search-bar"
            :loading="loading"
            @item-select="selectGame"
          />
        </template>
        <template v-else>
          <InputText v-model="manualName" placeholder="Enter game name" class="search-bar" />
        </template>
        <div class="image-wrapper">
          <img
            v-if="selectedGame && !isCustom"
            :src="getGameImage(selectedGame.appid)"
            :alt="selectedGame.name"
            class="result-image"
          />
          <img
            v-else
            :src="isCustom ? placeholderCustom : placeholderDefault"
            :alt="isCustom ? 'custom game placeholder' : 'placeholder'"
            class="result-image placeholder"
          />
        </div>
        <div class="modal-footer">
          <Button label="Add" class="p-button-primary" :disabled="!canAdd" @click="handleAddGame" />
          <Button label="Close" class="p-button-text" @click="closeModal" />
        </div>
      </div>
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
  // val is the new boolean state
  isCustom.value = !!val
  // clear selection/search when switching modes
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
    nameToSend = manualName.value
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
.search-bar {
  width: 100%;
  margin-bottom: 1rem;
}
.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
}
.result-image {
  width: 460px;
  max-width: 100%;
  height: 215px;
  object-fit: cover;
  border-radius: 4px;
  background: #f3f4f6;
}
.result-image.placeholder {
  display: block;
  object-fit: cover;
  opacity: 1;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
.option-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.option-label {
  font-weight: 600;
}
.search-bar { width: 100%; margin-bottom: 1rem }
</style>
