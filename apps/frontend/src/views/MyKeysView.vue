<template>
  <div class="my-keys-view" :class="{ 'mobile-detail-open': mobileShowDetail }">
    <!-- Sidebar -->
    <aside class="sidebar-card" :class="{ 'mobile-hidden': mobileShowDetail }">
      <div class="sidebar-header">
        <h3><i class="pi pi-list"></i> {{ t('myKeys.yourGames') }}</h3>
        <div class="header-actions">
          <Button icon="pi pi-ellipsis-v" class="p-button-text overflow-btn" @click="op && op.toggle($event)" :aria-label="t('myKeys.moreActions')" />
          <OverlayPanel ref="op">
            <div class="overflow-menu">
              <button class="menu-item" @click="exportForLesTrades(); op && op.hide()">
                <i class="pi pi-external-link"></i>
                <span>{{ t('myKeys.exportLestrades') }}</span>
              </button>
              <button class="menu-item" @click="exportAsMarkdown(); op && op.hide()">
                <i class="pi pi-file"></i>
                <span>{{ t('myKeys.exportMarkdown') }}</span>
              </button>
              <div class="menu-separator"></div>
              <button class="menu-item menu-item-danger" @click="confirmDeleteAllUsedKeys(); op && op.hide()">
                <i class="pi pi-trash"></i>
                <span>{{ t('myKeys.deleteAllUsed') }}</span>
              </button>
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
    <main class="content-card" :class="{ 'mobile-hidden': !mobileShowDetail }">
      <!-- Mobile back button -->
      <button v-if="selectedGameId" class="mobile-back-btn" @click="mobileGoBack">
        <i class="pi pi-arrow-left"></i>
        <span>{{ t('myKeys.yourGames') }}</span>
      </button>

      <div v-if="selectedGameId" class="game-details-container">
        <template v-if="selectedSteamAppId">
          <GameInfo :steamAppId="selectedSteamAppId" :userGameId="selectedGameId" :gameName="selectedGameName" @deleted="onGameDeleted" />
        </template>
        <template v-else>
          <CustomGameInfo v-if="selectedGameName" :gameName="selectedGameName" :userGameId="selectedGameId" :platform="selectedPlatform" @converted="reloadGamesAndRefreshSelection" @deleted="onGameDeleted" @platformUpdated="onPlatformUpdated" />
        </template>
        
        <div class="keys-section">
          <KeysTable :keys="keys" :gameId="selectedGameId" @refresh="refreshKeys" />
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-content">
          <div class="empty-icon-wrap">
            <i class="pi pi-box"></i>
          </div>
          <h3>{{ t('myKeys.emptyTitle') }}</h3>
          <p>{{ t('myKeys.emptyDesc') }}</p>
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
import { useI18n } from 'vue-i18n'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const games = ref<Game[]>([])
const keys = ref<any[]>([])
const selectedGameId = ref<number | null>(null)
const selectedSteamAppId = ref<number | null>(null)
const selectedGameName = ref<string | null>(null)
const selectedPlatform = ref<string | null>(null)
const mobileShowDetail = ref(false)

const isMobile = () => window.innerWidth <= 768

onMounted(async () => {
  document.title = 'My Keys — SteamKeyVault'
  const apiGames = await getUserGames()
  games.value = apiGames
})

const toast = useToast()
const confirm = useConfirm()
const op = vueRef<InstanceType<typeof OverlayPanel> | null>(null)
const { t } = useI18n()

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
    toast.add({ severity: 'success', summary: t('myKeys.clipboardCopied'), detail: t('myKeys.exportCopied'), life: 3000 })
  } catch (err) {
    console.error('Failed to copy export:', err)
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('myKeys.exportCopyFailed'), life: 3000 })
  }
}

function exportAsMarkdown() {
  // Build a markdown list of games. Steam games are links to the store page.
  const parts: string[] = []
  const escapeMd = (s: string) => (s || '').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  ;(games.value as any[]).forEach((g: any) => {
    const name = escapeMd(g.name || '')
    if (g.steamapp_id) {
      parts.push(`- [${name}](https://store.steampowered.com/app/${g.steamapp_id})`)
    } else {
      parts.push(`- ${name}`)
    }
  })
  const out = parts.join('\n')
  try {
    navigator.clipboard.writeText(out)
    toast.add({ severity: 'success', summary: t('myKeys.clipboardCopied'), detail: t('myKeys.exportCopied'), life: 3000 })
  } catch (err) {
    console.error('Failed to copy markdown export:', err)
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('myKeys.exportCopyFailed'), life: 3000 })
  }
}

function confirmDeleteAllUsedKeys() {
  confirm.require({
    message: t('myKeys.deleteAllMessage'),
    header: t('myKeys.deleteAllHeader'),
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: t('myKeys.deleteAllCancel'),
    acceptLabel: t('myKeys.deleteAllConfirm'),
    accept: async () => {
      try {
        const result = await removeAllUsedKeys()
        toast.add({ 
          severity: 'success', 
          summary: t('myKeys.deleteAllSuccess'), 
          detail: t('myKeys.deleteAllCount', { count: result.deleted, suffix: result.deleted !== 1 ? 's' : '' }), 
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
          summary: t('common.error'), 
          detail: t('myKeys.deleteAllFailed'), 
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
  selectedPlatform.value = game.platform ?? null
  if (isMobile()) {
    mobileShowDetail.value = true
  }
  refreshKeys()
}

function mobileGoBack() {
  mobileShowDetail.value = false
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
      selectedPlatform.value = (found as any).platform ?? null
    }
    await refreshKeys()
  }
}

async function onPlatformUpdated(newPlatform: string) {
  selectedPlatform.value = newPlatform || null
  // Keep the in-memory list in sync so the sidebar / next selection reflect the change
  const idx = (games.value as any[]).findIndex((g: any) => g.user_game_id === selectedGameId.value)
  if (idx !== -1) {
    ;(games.value as any[])[idx] = { ...(games.value as any[])[idx], platform: newPlatform || null }
  }
}

async function onGameDeleted() {
  // reload games and reset selection
  const apiGames = await getUserGames()
  games.value = apiGames
  selectedGameId.value = null
  selectedSteamAppId.value = null
  selectedGameName.value = null
  selectedPlatform.value = null
  keys.value = []
  mobileShowDetail.value = false
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
  padding: 0.25rem;
  min-width: 13rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.5rem 0.65rem;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: background 0.12s, color 0.12s;
}

.menu-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.menu-item .pi {
  font-size: 0.875rem;
  width: 1rem;
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: color 0.12s;
}

.menu-item:hover .pi {
  color: var(--text-secondary);
}

.menu-separator {
  height: 1px;
  background: var(--border-color);
  margin: 0.25rem 0.5rem;
}

.menu-item-danger {
  color: #dc2626;
}

.menu-item-danger .pi {
  color: #dc2626;
}

.menu-item-danger:hover {
  background: color-mix(in srgb, #dc2626 10%, transparent);
  color: #dc2626;
}

.menu-item-danger:hover .pi {
  color: #dc2626;
}

.my-app-dark .menu-item-danger,
.my-app-dark .menu-item-danger .pi {
  color: #f87171;
}

.my-app-dark .menu-item-danger:hover {
  background: color-mix(in srgb, #f87171 10%, transparent);
  color: #f87171;
}

.my-app-dark .menu-item-danger:hover .pi {
  color: #f87171;
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
  min-width: 0;
  overflow: hidden;
}

.game-details-container {
  display: flex;
  flex-direction: column;
  min-width: 0;
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

.empty-icon-wrap {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.empty-icon-wrap .pi {
  font-size: 1.75rem;
  color: var(--primary-color);
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

/* Mobile back button — hidden on desktop */
.mobile-back-btn {
  display: none;
}

/* Responsive — tablet */
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

/* Responsive — mobile: view-switching pattern */
@media (max-width: 768px) {
  .my-keys-view {
    grid-template-columns: 1fr;
    padding: 0 0.75rem;
    margin-top: 1rem;
    gap: 0;
    min-height: auto;
  }

  .sidebar-card {
    height: auto;
    max-height: none;
    position: static;
    border-radius: 0.75rem;
    padding: 1rem;
  }

  .sidebar-header h3 {
    font-size: 1.1rem;
    gap: 0.5rem;
  }

  .games-list-container {
    max-height: calc(100vh - 16rem);
    margin: 0 -0.5rem;
    padding: 0 0.5rem;
  }

  .sidebar-actions {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }

  .content-card {
    padding: 1rem;
    min-height: auto;
    border-radius: 0.75rem;
    overflow-x: hidden;
  }

  .game-details-container {
    max-width: 100%;
    overflow: hidden;
  }

  .empty-state {
    min-height: 12rem;
  }

  .empty-icon-wrap {
    width: 3rem;
    height: 3rem;
  }

  .empty-icon-wrap .pi {
    font-size: 1.35rem;
  }

  .empty-state h3 {
    font-size: 1.2rem;
  }

  .empty-state p {
    font-size: 0.875rem;
  }

  /* View switching: show list OR detail, not both */
  .mobile-hidden {
    display: none !important;
  }

  /* When detail is open, content takes full space */
  .my-keys-view.mobile-detail-open {
    gap: 0;
  }

  .my-keys-view.mobile-detail-open .content-card {
    margin-top: 0;
  }

  /* Mobile back button */
  .mobile-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    padding: 0.4rem 0;
    margin-bottom: 0.75rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--primary-color);
    transition: opacity 0.15s;
  }

  .mobile-back-btn:hover {
    opacity: 0.8;
  }

  .mobile-back-btn .pi {
    font-size: 0.8rem;
  }

  .keys-section {
    margin-top: 0.75rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
