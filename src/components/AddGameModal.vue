<template>
  <div>
    <Button class="add-game-btn" label="Add a Game" icon="pi pi-plus" @click="openModal" />
    <Dialog v-model:visible="showModal" modal header="Add a Game" :style="{ width: '400px' }" :closable="true" @hide="closeModal">
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
        <div v-if="selectedGame">
          <img :src="getGameImage(selectedGame.appid)" :alt="selectedGame.name" class="result-image" />

        </div>
        <div v-else class="no-results">
          <span>Search and select a game to add</span>
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
import { ref } from 'vue'
import { searchSteamGames, addUserGame } from '../api/games'
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import AutoComplete from 'primevue/autocomplete';

const showModal = ref(false)
const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const debounceTimeout = ref<Timeout | null>(null)
const selectedGame = ref<any | null>(null)

function openModal() {
  showModal.value = true
  searchQuery.value = ''
  results.value = []
}
function closeModal() {
  selectedGame.value = null
  showModal.value = false
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
  await addUserGame({ name: selectedGame.value.name, steamappid: selectedGame.value.appid })
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
.result-image {
  display: flex;
  margin: 0 auto;
  width: 50%;
  height: 50%;
  border-radius: 4px;
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
