<template>
  <div>
    <button class="add-game-btn" @click="openModal">Add a Game</button>
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>Add a Game</h2>
        <input
          v-model="searchQuery"
          @input="searchGames"
          type="text"
          placeholder="Search for a Steam game..."
          class="search-bar"
        />
        <div v-if="loading" class="loading">Searching...</div>
        <ul v-if="results.length > 0" class="results-list">
          <li v-for="game in results" :key="game.appid" @click="selectGame(game)" class="result-item">
            <img :src="getGameImage(game.appid)" :alt="game.name" class="result-image" />
            <span>{{ game.name }}</span>
          </li>
        </ul>
        <div v-else-if="searchQuery && !loading" class="no-results">No results found.</div>
        <button class="close-btn" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { searchSteamGames } from '../api/games'

const showModal = ref(false)
const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)

function openModal() {
  showModal.value = true
  searchQuery.value = ''
  results.value = []
}
function closeModal() {
  showModal.value = false
}

async function searchGames() {
  if (!searchQuery.value.trim()) {
    results.value = []
    return
  }
  loading.value = true
  try {
    results.value = await searchSteamGames(searchQuery.value)
  } catch (e) {
    results.value = []
  } finally {
    loading.value = false
  }
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
  margin-bottom: 1.5rem;
  padding: 0.6rem 1.5rem;
  background: var(--skv-primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.add-game-btn:hover {
  background: var(--skv-accent);
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  min-width: 350px;
  max-width: 90vw;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  position: relative;
}
.search-bar {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid var(--skv-gray);
}
.results-list {
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding: 0;
  list-style: none;
}
.result-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.result-item:hover {
  background: #f0f6ff;
}
.result-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 1rem;
  background: #eee;
}
.close-btn {
  margin-top: 1rem;
  background: var(--skv-secondary);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
}
.close-btn:hover {
  background: var(--skv-accent);
}
.loading {
  color: var(--skv-primary);
  margin-bottom: 1rem;
}
.no-results {
  color: var(--skv-secondary);
  font-style: italic;
  margin-bottom: 1rem;
}
</style>
