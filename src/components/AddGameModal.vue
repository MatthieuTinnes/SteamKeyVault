<template>
  <div>
    <Button label="Add Game" icon="pi pi-plus" class="p-button-sm w-full" @click="openModal" />
    <Dialog v-model:visible="visible" header="Add a Game" :style="{ width: '400px' }" :closable="true">
      <div class="p-fluid">
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
        <div class="image-wrapper">
          <img
            v-if="selectedGame"
            :src="getGameImage(selectedGame.appid)"
            :alt="selectedGame.name"
            class="result-image"
          />
          <img
            v-else
            src="../assets/placeholder-460x215.svg"
            alt="placeholder"
            class="result-image placeholder"
          />
        </div>
        <div class="modal-footer">
          <Button label="Add" class="p-button-primary" :disabled="!selectedGame" @click="handleAddGame" />
          <Button label="Close" class="p-button-text" @click="closeModal" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { searchSteamGames, addUserGame } from '../api/games'
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import AutoComplete from 'primevue/autocomplete';

const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const debounceTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const selectedGame = ref<any | null>(null)
const emit = defineEmits<{
  (e: 'gameSelected', game: any): void
  (e: 'added'): void
}>()

const visible = ref(false)

function openModal() {
  visible.value = true
  searchQuery.value = ''
  results.value = []
}
function closeModal() {
  selectedGame.value = null
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

async function handleAddGame() {
  if (!selectedGame.value) return
  const response = await addUserGame({ name: selectedGame.value.name, steamappid: selectedGame.value.appid })
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
.add-game-btn {
  margin-bottom: 1rem;
}
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
  opacity: 0.9;
}
.no-results {
  margin: 1rem 0;
  text-align: center;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
