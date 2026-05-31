<template>
  <div class="admin-dashboard">
    <h2><i class="pi pi-shield"></i> {{ t('admin.dashboardTitle') }}</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <i class="pi pi-users stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.stats.totalUsers') }}</div>
          <div class="stat-value">{{ stats.total_users ?? '-' }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <i class="pi pi-check-circle stat-icon verified"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.stats.verifiedUsers') }}</div>
          <div class="stat-value">{{ stats.verified_users ?? '-' }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <i class="pi pi-shield stat-icon admin"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.stats.adminUsers') }}</div>
          <div class="stat-value">{{ stats.admin_users ?? '-' }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <i class="pi pi-box stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.stats.totalGames') }}</div>
          <div class="stat-value">{{ stats.total_games ?? '-' }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <i class="pi pi-key stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.stats.totalKeys') }}</div>
          <div class="stat-value">{{ stats.total_keys ?? '-' }}</div>
        </div>
      </div>
    </div>

    <div class="admin-sections">
      <div class="section-card" @click="router.push(`/${locale}/admin/users`)">
        <i class="pi pi-users"></i>
        <h3>{{ t('admin.sections.userManagement') }}</h3>
        <p>{{ t('admin.sections.userManagementDesc') }}</p>
      </div>
      
      <div class="section-card" @click="router.push(`/${locale}/admin/steam`)">
        <i class="pi pi-cloud-download"></i>
        <h3>{{ t('admin.sections.steamSync') }}</h3>
        <p>{{ t('admin.sections.steamSyncDesc') }}</p>
      </div>

      <div class="section-card" @click="router.push(`/${locale}/admin/logs`)">
        <i class="pi pi-book"></i>
        <h3>{{ t('admin.sections.actionLogs') }}</h3>
        <p>{{ t('admin.sections.actionLogsDesc') }}</p>
      </div>
    </div>

    <div class="version-section">
      <h3><i class="pi pi-info-circle"></i> {{ t('admin.version.title') }}</h3>
      <div class="version-grid">
        <div class="version-card">
          <div class="version-label">{{ t('admin.version.frontend') }}</div>
          <div class="version-details">
            <div v-if="frontendVersion.commit_hash" class="version-hash">
              <span class="version-key">{{ t('admin.version.commit') }}</span>
              <code>{{ frontendVersion.commit_hash.substring(0, 7) }}</code>
            </div>
            <div v-if="frontendVersion.deploy_date" class="version-date">
              <span class="version-key">{{ t('admin.version.deployDate') }}</span>
              <span>{{ formatDate(frontendVersion.deploy_date) }}</span>
            </div>
            <div v-if="!frontendVersion.commit_hash && !frontendVersion.deploy_date" class="version-unknown">
              {{ t('admin.version.unknown') }}
            </div>
          </div>
        </div>
        <div class="version-card">
          <div class="version-label">{{ t('admin.version.backend') }}</div>
          <div class="version-details">
            <div v-if="backendVersion.commit_hash" class="version-hash">
              <span class="version-key">{{ t('admin.version.commit') }}</span>
              <code>{{ backendVersion.commit_hash.substring(0, 7) }}</code>
            </div>
            <div v-if="backendVersion.deploy_date" class="version-date">
              <span class="version-key">{{ t('admin.version.deployDate') }}</span>
              <span>{{ formatDate(backendVersion.deploy_date) }}</span>
            </div>
            <div v-if="!backendVersion.commit_hash && !backendVersion.deploy_date" class="version-unknown">
              {{ t('admin.version.unknown') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAdminStats, getBackendVersion } from '@/api/admin'
import type { AdminStats, VersionInfo } from '@/api/admin'
import { showErrorToast } from '@/utils/toast'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t, locale } = useI18n()
const stats = ref<AdminStats>({
  total_users: 0,
  verified_users: 0,
  admin_users: 0,
  total_games: 0,
  total_keys: 0,
})

const frontendVersion = ref<VersionInfo>({
  commit_hash: window.config?.VITE_COMMIT_HASH || import.meta.env.VITE_COMMIT_HASH || '',
  deploy_date: window.config?.VITE_DEPLOY_DATE || import.meta.env.VITE_DEPLOY_DATE || '',
})

const backendVersion = ref<VersionInfo>({
  commit_hash: '',
  deploy_date: '',
})

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleString(locale.value, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

onMounted(async () => {
  try {
    const [statsRes, versionRes] = await Promise.all([
      getAdminStats(),
      getBackendVersion(),
    ])
    stats.value = statsRes.data
    backendVersion.value = versionRes.data
  } catch (error) {
    showErrorToast(t('admin.statsFailed'))
  }
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 75rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.admin-dashboard h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: background-color 0.3s ease;
}

.stat-icon {
  font-size: 2.5rem;
  color: #2563eb;
}

.stat-icon.verified {
  color: #059669;
}

.stat-icon.admin {
  color: #dc2626;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1.5rem;
}

.section-card {
  background: var(--bg-primary);
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.3s ease;
  text-align: center;
}

.section-card:hover {
  transform: translateY(-0.25rem);
  box-shadow: var(--shadow-lg);
}

.section-card i {
  font-size: 3rem;
  color: #2563eb;
  margin-bottom: 1rem;
}

.section-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.section-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 48rem) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  }
}

.version-section {
  margin-top: 2rem;
}

.version-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.version-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}

.version-card {
  background: var(--bg-primary);
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: var(--shadow-md);
  transition: background-color 0.3s ease;
}

.version-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.version-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.version-hash,
.version-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.version-key {
  font-weight: 500;
}

.version-details code {
  background: var(--bg-secondary, #f3f4f6);
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  font-family: monospace;
}

.version-unknown {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
}
</style>
