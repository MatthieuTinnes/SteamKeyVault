<template>
  <div>
    <Button class="add-game-btn" label="Add a Game" icon="pi pi-plus" @click="openModal" />
    <Dialog v-model:visible="showModal" modal header="Add a Game" :style="{ width: '400px' }" :closable="true" @hide="closeModal">
      <div class="p-fluid">
        <AutoComplete
          v-model="searchQuery"
          :suggestions="results.flatMap(game => (game.name))"
          @complete="onComplete"
          field="name"
          type="text"
          placeholder="Search for a Steam game..."
          class="search-bar"
          :loading="loading"
          @item-select="selectGame"
        />
        <div class="modal-footer">
          <Button label="Close" class="p-button-text" @click="closeModal" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { searchSteamGames } from '../api/games'
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import AutoComplete from 'primevue/autocomplete';

const showModal = ref(false)
const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const debounceTimeout = ref<Timeout | null>(null)

function openModal() {
  showModal.value = true
  searchQuery.value = ''
  results.value = []
}
function closeModal() {
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

function selectGame(game: any) {
  // Emit event to parent (to be handled in MyKeysView)
  // You can use defineEmits if you want to handle the add in parent
  // For now, just close modal
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
.results-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}
.result-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}
.result-item:hover {
  background: #f0f4fa;
}
.result-image {
  width: 40px;
  height: 40px;
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
