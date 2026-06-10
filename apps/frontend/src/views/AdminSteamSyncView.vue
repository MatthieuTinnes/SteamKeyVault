<template>
  <div class="admin-steam">
    <div class="header">
      <h2><i class="pi pi-cloud-download"></i> {{ t('admin.steam.title') }}</h2>
      <Button :label="t('admin.users.backToDashboard')" icon="pi pi-arrow-left" @click="router.push(`/${locale}/admin`)" severity="secondary" />
    </div>

    <div class="stats-section">
      <h3>{{ t('admin.steam.statsTitle') }}</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('admin.steam.totalApps') }}</div>
          <div class="stat-value">{{ steamStats.total_steam_apps?.toLocaleString() ?? '-' }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">{{ t('admin.steam.totalUserGames') }}</div>
          <div class="stat-value">{{ steamStats.total_user_games?.toLocaleString() ?? '-' }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">{{ t('admin.steam.uniqueGamesAdded') }}</div>
          <div class="stat-value">{{ steamStats.unique_games_added?.toLocaleString() ?? '-' }}</div>
        </div>
      </div>
    </div>

    <div class="actions-section">
      <h3>{{ t('admin.steam.actionsTitle') }}</h3>
      
      <div class="action-card">
        <div class="action-info">
          <h4><i class="pi pi-refresh"></i> {{ t('admin.steam.refreshTitle') }}</h4>
          <p>{{ t('admin.steam.refreshDesc') }}</p>
        </div>
        <Button 
          :label="t('admin.steam.refreshButton')" 
          icon="pi pi-refresh" 
          @click="refreshSteamAppsAction"
          :loading="refreshing"
          severity="info"
        />
      </div>
    </div>

    <Dialog v-model:visible="showRefreshDialog" :header="t('admin.steam.refreshComplete')" :modal="true" :style="{ width: '30rem' }">
      <p v-if="refreshResult">
        {{ t('admin.steam.refreshSuccess', { count: refreshResult.total_apps?.toLocaleString() }) }}
      </p>
      <template #footer>
        <Button :label="t('common.ok')" @click="closeRefreshDialog" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { getSteamStats, refreshSteamApps } from '@/api/admin'
import type { SteamStats } from '@/api/admin'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const steamStats = ref<SteamStats>({
  total_steam_apps: 0,
  total_user_games: 0,
  unique_games_added: 0,
})
const refreshing = ref(false)
const showRefreshDialog = ref(false)
const refreshResult = ref<any>(null)
const { t, locale } = useI18n()

onMounted(async () => {
  await loadSteamStats()
})

async function loadSteamStats() {
  try {
    const response = await getSteamStats()
    steamStats.value = response.data
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || t('admin.steam.failedLoadStats'))
  }
}

async function refreshSteamAppsAction() {
  refreshing.value = true
  try {
    const response = await refreshSteamApps()
    refreshResult.value = response.data
    showRefreshDialog.value = true
    await loadSteamStats()
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || t('admin.steam.failedRefresh'))
  } finally {
    refreshing.value = false
  }
}

function closeRefreshDialog() {
  showRefreshDialog.value = false
  refreshResult.value = null
}
</script>

<style scoped>
.admin-steam {
  max-width: 75rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.stats-section {
  background: var(--bg-primary);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  transition: background-color 0.3s ease;
}

.stats-section h3 {
  margin: 0 0 1.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 0.375rem;
  padding: 1rem;
  text-align: center;
  transition: background-color 0.3s ease;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.actions-section {
  background: var(--bg-primary);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  transition: background-color 0.3s ease;
}

.actions-section h3 {
  margin: 0 0 1.5rem 0;
}

.action-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 0.375rem;
  border: 0.0625rem solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.action-info {
  flex: 1;
}

.action-info h4 {
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.action-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 56.25rem) {
  .action-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
