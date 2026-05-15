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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAdminStats } from '@/api/admin'
import type { AdminStats } from '@/api/admin'
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

onMounted(async () => {
  try {
    const response = await getAdminStats()
    stats.value = response.data
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
</style>
