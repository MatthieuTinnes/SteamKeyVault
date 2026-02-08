<template>
  <div class="my-keys-view">
    <!-- Sidebar -->
    <aside class="sidebar-card">
      <div class="sidebar-header">
        <h3><i class="pi pi-list"></i> Your Games</h3>
        <div class="header-actions">
          <Button icon="pi pi-ellipsis-v" class="p-button-text overflow-btn" @click="op && op.toggle($event)" aria-label="More actions" />
          <OverlayPanel ref="op">
            <div class="overflow-menu">
              <Button class="p-button-text" icon="pi pi-external-link" label="Export for lestrades.com" @click="exportForLesTrades(); op && op.hide()" />
              <Button class="p-button-text p-button-danger" icon="pi pi-trash" label="Delete all used keys" @click="confirmDeleteAllUsedKeys(); op && op.hide()" />
            </div>
          </OverlayPanel>
        </div>
      </div>
      <div class="games-list-container">
        <UserGamesList :games="games" @gameSelected="handleGameSelected" />
      </div>
      <div class="sidebar-actions">
        <AddGameModal @added="reloadGames"/>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content-card">
      <div v-if="selectedGameId" class="game-details-container">
        <template v-if="selectedSteamAppId">
          <GameInfo :steamAppId="selectedSteamAppId" :userGameId="selectedGameId" :gameName="selectedGameName" @deleted="onGameDeleted" />
        </template>
        <template v-else>
          <CustomGameInfo v-if="selectedGameName" :gameName="selectedGameName" :userGameId="selectedGameId" @converted="reloadGamesAndRefreshSelection" @deleted="onGameDeleted" />
        </template>
        
        <div class="keys-section">
          <KeysTable :keys="keys" :gameId="selectedGameId" @refresh="refreshKeys" />
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-content">
          <i class="pi pi-box empty-icon"></i>
          <h3>No Game Selected</h3>
          <p>Select a game from the sidebar to view details and manage keys.</p>
        </div>
      </div>
    </main>
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
import { getUserGames } from '../api/games'
import { getKeysForGame, removeAllUsedKeys } from '../api/keys'
import type { Game } from '@/models/Game';
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { ref as vueRef } from 'vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const games = ref([])
const keys = ref([])
const selectedGameId = ref<number | null>(null)
const selectedSteamAppId = ref<number | null>(null)
const selectedGameName = ref<string | null>(null)

onMounted(async () => {
  const apiGames = await getUserGames()
  games.value = apiGames;
})

const toast = useToast()
const confirm = useConfirm()
const op = vueRef<InstanceType<typeof OverlayPanel> | null>(null)

function exportForLesTrades() {
  // Format: gameName1/steamAppId1,gameName2/steamAppId2,customGameName,gameName3/steamAppId3
  const parts: string[] = []
  ;(games.value as any[]).forEach((g: any) => {
    const name = (g.name || '').replace(/[,\/]/g, '')
    if (g.steamapp_id) {
      parts.push(`${name}/${g.steamapp_id}`)
    } else {
      parts.push(name)
    }
  })
  const out = parts.join('\n')
  try {
    navigator.clipboard.writeText(out)
    toast.add({ severity: 'success', summary: 'Copied', detail: 'Export copied to clipboard', life: 3000 })
  } catch (err) {
    console.error('Failed to copy export:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy export', life: 3000 })
  }
}

function confirmDeleteAllUsedKeys() {
  confirm.require({
    message: 'Are you sure you want to delete all used keys from all your games? This action cannot be undone.',
    header: 'Delete All Used Keys',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: async () => {
      try {
        const result = await removeAllUsedKeys()
        toast.add({ 
          severity: 'success', 
          summary: 'Keys Deleted', 
          detail: `${result.deleted} key${result.deleted !== 1 ? 's' : ''} deleted`, 
          life: 3000 
        })
        // Refresh the current game's keys if one is selected
        if (selectedGameId.value) {
          await refreshKeys()
        }
      } catch (err) {
        console.error('Failed to delete used keys:', err)
        toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to delete used keys', 
          life: 3000 
        })
      }
    }
  })
}

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

async function reloadGames(newGameData?: { id: number }) {
  const apiGames = await getUserGames()
  games.value = apiGames;
  
  if (newGameData && newGameData.id) {
    const found = (games.value as Game[]).find((g) => g.user_game_id === newGameData.id)
    if (found) {
      handleGameSelected(found)
    }
  }
}

// After conversion we want to refresh the game list and update the
// currently selected game's Steam ID/name so GameInfo reloads.
async function reloadGamesAndRefreshSelection() {
  const apiGames = await getUserGames()
  games.value = apiGames;
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
.my-keys-view {
  max-width: 100%;
  margin-top: 2rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 20rem 1fr;
  gap: 1.5rem;
  align-items: start;
  min-height: calc(100vh - 10rem);
}

/* Sidebar */
.sidebar-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 10rem);
  position: sticky;
  top: 6rem;
  overflow: hidden;
}

.sidebar-header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.overflow-btn {
  color: var(--text-secondary);
}

.overflow-menu {
  display: flex;
  flex-direction: column;
  padding: 0.1rem;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.games-list-container {
  flex: 1;
  overflow-y: auto;
  margin: 0 -1rem; /* Negative margin to allow scrollbar to be at edge */
  padding: 0 1rem;
}

.sidebar-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

/* Main Content */
.content-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  min-height: 30rem;
}

.game-details-container {
  display: flex;
  flex-direction: column;
}

.keys-section {
  margin-top: 1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 20rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-tertiary);
  margin-bottom: 0.5rem;
}

.empty-state h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
  max-width: 20rem;
}

/* Responsive */
@media (max-width: 64rem) {
  .my-keys-view {
    grid-template-columns: 1fr;
    height: auto;
  }

  .sidebar-card {
    height: auto;
    max-height: 30rem;
    position: static;
  }
}
</style>
