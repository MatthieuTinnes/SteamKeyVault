<template>
  <div class="admin-steam">
    <div class="header">
      <h2><i class="pi pi-cloud-download"></i> Steam Synchronization</h2>
      <Button label="Back to Dashboard" icon="pi pi-arrow-left" @click="router.push('/admin')" severity="secondary" />
    </div>

    <div class="stats-section">
      <h3>Steam Database Statistics</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Steam Apps in DB</div>
          <div class="stat-value">{{ steamStats.total_steam_apps?.toLocaleString() ?? '-' }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Total User Games</div>
          <div class="stat-value">{{ steamStats.total_user_games?.toLocaleString() ?? '-' }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Unique Games Added</div>
          <div class="stat-value">{{ steamStats.unique_games_added?.toLocaleString() ?? '-' }}</div>
        </div>
      </div>
    </div>

    <div class="actions-section">
      <h3>Synchronization Actions</h3>
      
      <div class="action-card">
        <div class="action-info">
          <h4><i class="pi pi-refresh"></i> Refresh Steam Apps Database</h4>
          <p>
            Fetches the latest list of all Steam applications from the Steam API and updates the local database.
            This process may take several minutes.
          </p>
        </div>
        <Button 
          label="Refresh Steam Apps" 
          icon="pi pi-refresh" 
          @click="refreshSteamAppsAction"
          :loading="refreshing"
          severity="info"
        />
      </div>
    </div>

    <Dialog v-model:visible="showRefreshDialog" header="Refresh Complete" :modal="true" :style="{ width: '30rem' }">
      <p v-if="refreshResult">
        Successfully refreshed <strong>{{ refreshResult.total_apps?.toLocaleString() }}</strong> Steam apps in the database.
      </p>
      <template #footer>
        <Button label="OK" @click="closeRefreshDialog" />
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

const router = useRouter()
const steamStats = ref<SteamStats>({
  total_steam_apps: 0,
  total_user_games: 0,
  unique_games_added: 0,
})
const refreshing = ref(false)
const showRefreshDialog = ref(false)
const refreshResult = ref<any>(null)

onMounted(async () => {
  await loadSteamStats()
})

async function loadSteamStats() {
  try {
    const response = await getSteamStats()
    steamStats.value = response.data
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || 'Failed to load Steam stats')
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
    showErrorToast(error?.response?.data?.error || 'Failed to refresh Steam apps')
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
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
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
  background: #f9fafb;
  border-radius: 0.375rem;
  padding: 1rem;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.actions-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.1);
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
  background: #f9fafb;
  border-radius: 0.375rem;
  border: 0.0625rem solid #e5e7eb;
}

.action-info {
  flex: 1;
}

.action-info h4 {
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #111827;
}

.action-info p {
  margin: 0;
  color: #6b7280;
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
