<template>
  <div class="my-keys-layout">
    <div class="my-keys-sidebar">
      <UserGamesList :games="games" @gameSelected="handleGameSelected" />
      <div class="my-keys-actions">
        <AddGameModal @added="reloadGames"/>
      </div>
    </div>
    <div class="my-keys-main">
      <Card class="my-keys-card">
        <template #content>
                <div v-if="selectedGameId">
                  <template v-if="selectedSteamAppId">
                    <GameInfo :steamAppId="selectedSteamAppId" :userGameId="selectedGameId" @deleted="onGameDeleted" />
                  </template>
                  <template v-else>
                    <CustomGameInfo v-if="selectedGameName" :gameName="selectedGameName" :userGameId="selectedGameId" @converted="reloadGamesAndRefreshSelection" @deleted="onGameDeleted" />
                  </template>
                  <KeysTable :keys="keys" :gameId="selectedGameId" @refresh="refreshKeys" />
                </div>
          <div v-else class="no-selection">
            <p>Please select a game from the left to view details and keys.</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { computed, ref, onMounted } from 'vue'
import UserGamesList from '../components/UserGamesList.vue'
import KeysTable from '../components/KeysTable.vue'
import GameInfo from '../components/GameInfo.vue'
import CustomGameInfo from '../components/CustomGameInfo.vue'
import AddGameModal from '../components/AddGameModal.vue'
import Card from 'primevue/card';
import { getUserGames } from '../api/games'
import { getKeysForGame } from '../api/keys'
import type { Game } from '@/models/Game';

const userStore = useUserStore()
const user = computed(() => userStore.user)
const showAddGameModal = ref(false)
const games = ref([])
const keys = ref([])
const selectedGameId = ref<number | null>(null)
const selectedSteamAppId = ref<number | null>(null)
const selectedGameName = ref<string | null>(null)

onMounted(async () => {
  const apiGames = await getUserGames()
  games.value = apiGames;
})

function handleGameSelected(game: Game) {
  selectedGameId.value = game.user_game_id
  selectedSteamAppId.value = game.steamapp_id
  selectedGameName.value = game.name ?? null
  refreshKeys()
}

async function refreshKeys() {
  if (!selectedGameId.value) {
    keys.value = []
    return
  }
  const apiKeys = await getKeysForGame(selectedGameId.value)
  keys.value = apiKeys
}

async function reloadGames() {
  const apiGames = await getUserGames()
  games.value = apiGames;
  showAddGameModal.value = false;
}

// After conversion we want to refresh the game list and update the
// currently selected game's Steam ID/name so GameInfo reloads.
async function reloadGamesAndRefreshSelection() {
  const apiGames = await getUserGames()
  games.value = apiGames;
  showAddGameModal.value = false;
  // if a game is selected, find updated version and update selected refs
  if (selectedGameId.value) {
    const found = (games.value as any[]).find((g: any) => g.user_game_id === selectedGameId.value)
    if (found) {
      selectedSteamAppId.value = (found as any).steamapp_id
      selectedGameName.value = (found as any).name ?? null
    }
    await refreshKeys()
  }
}

async function onGameDeleted() {
  // reload games and reset selection
  const apiGames = await getUserGames()
  games.value = apiGames
  selectedGameId.value = null
  selectedSteamAppId.value = null
  selectedGameName.value = null
  keys.value = []
}
</script>

<style scoped>
.my-keys-layout {
  display: flex;
  min-height: 60vh;
  gap: 1rem;
}
.my-keys-sidebar {
  flex: 0 0 clamp(14rem, 20vw, 20rem);
  max-width: clamp(14rem, 20vw, 20rem);
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
  padding: 2rem 1rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: fit-content;
  margin-left: 1rem;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}
.my-keys-main {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-right: 1rem;
}
.my-keys-card {
  width: 100%;
  max-width: 100%;
}
.my-keys-actions {
  margin-top: 2rem;
}

.game-info {
  margin-bottom: 1em;
}

.no-selection {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg-primary);
  border-radius: 0.5rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
