<template>
  <div class="admin-logs">
    <div class="header">
      <h2><i class="pi pi-clipboard"></i> {{ t('admin.logs.title') }}</h2>
      <div class="header-actions">
        <Button
          :label="t('admin.users.backToDashboard')"
          icon="pi pi-arrow-left"
          @click="router.push('/admin')"
          severity="secondary"
        />
        <Button :label="t('admin.logs.refresh')" icon="pi pi-refresh" @click="loadAll" :loading="loading" />
      </div>
    </div>

    <div class="filters-card">
      <div class="filters-grid">
        <div class="field">
          <label>{{ t('admin.logs.start') }}</label>
          <InputText v-model="startInput" type="datetime-local" />
        </div>
        <div class="field">
          <label>{{ t('admin.logs.end') }}</label>
          <InputText v-model="endInput" type="datetime-local" />
        </div>
        <div class="field">
          <label>{{ t('admin.logs.action') }}</label>
          <Dropdown
            v-model="actionFilter"
            :options="actionOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('admin.logs.allActionsOption')"
          />
        </div>
        <div class="field">
          <label>{{ t('admin.logs.userSearch') }}</label>
          <InputText v-model="userQuery" :placeholder="t('admin.logs.userSearchPlaceholder')" />
        </div>
      </div>
      <div class="filters-actions">
        <Button :label="t('admin.logs.apply')" icon="pi pi-filter" @click="loadAll" :loading="loading" />
        <Button :label="t('admin.logs.last24h')" text @click="setLast24Hours" />
      </div>
    </div>

    <div class="period-summary" v-if="stats.start && stats.end">
      {{ t('admin.logs.showingRange', { start: formatDateTime(stats.start), end: formatDateTime(stats.end) }) }}
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <i class="pi pi-chart-line stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.logs.totalActions') }}</div>
          <div class="stat-value">{{ stats.total_actions ?? '-' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="pi pi-sign-in stat-icon login"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.logs.logins') }}</div>
          <div class="stat-value">{{ stats.logins ?? '-' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="pi pi-lock stat-icon password"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.logs.passwordChanges') }}</div>
          <div class="stat-value">{{ stats.password_changes ?? '-' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="pi pi-envelope stat-icon email"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.logs.emailChanges') }}</div>
          <div class="stat-value">{{ stats.email_changes ?? '-' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="pi pi-users stat-icon users"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('admin.logs.uniqueUsers') }}</div>
          <div class="stat-value">{{ stats.unique_users ?? '-' }}</div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>{{ t('admin.logs.allActions') }}</h3>
        <span class="table-total">{{ t('admin.logs.results', { count: total }) }}</span>
      </div>
      <DataTable :value="logs" :loading="loading" stripedRows paginator :rows="rowsPerPage">
        <Column field="created_at" :header="t('admin.logs.time')" sortable style="width: 12rem">
          <template #body="{ data }">
            {{ formatDateTime(data.created_at) }}
          </template>
        </Column>
        <Column field="action_type" :header="t('admin.logs.action')" sortable style="width: 12rem">
          <template #body="{ data }">
            <span class="action-pill" :class="actionClass(data.action_type)">
              {{ formatAction(data.action_type) }}
            </span>
          </template>
        </Column>
        <Column :header="t('admin.logs.user')" style="width: 16rem">
          <template #body="{ data }">
            <div class="user-cell">
              <div class="user-name">{{ data.username }}</div>
              <div class="user-email">{{ data.email }}</div>
            </div>
          </template>
        </Column>
        <Column field="ip_address" :header="t('admin.logs.ip')" style="width: 10rem"></Column>
        <Column field="user_agent" :header="t('admin.logs.userAgent')">
          <template #body="{ data }">
            <span class="muted">{{ data.user_agent || '-' }}</span>
          </template>
        </Column>
        <Column :header="t('admin.logs.metadata')" style="width: 16rem">
          <template #body="{ data }">
            <span class="muted">{{ formatMetadata(data.metadata) }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { getActionLogStats, getActionLogs } from '@/api/admin'
import type { ActionLogEntry, ActionLogStats } from '@/api/admin'
import { showErrorToast } from '@/utils/toast'
import { useTableRowsPerPage } from '@/composables/useTableRowsPerPage'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const logs = ref<ActionLogEntry[]>([])
const stats = ref<ActionLogStats>({
  total_actions: 0,
  logins: 0,
  password_changes: 0,
  email_changes: 0,
  unique_users: 0,
  start: '',
  end: '',
})
const total = ref(0)
const loading = ref(false)

const startInput = ref('')
const endInput = ref('')
const actionFilter = ref('')
const userQuery = ref('')
const { t } = useI18n()

const actionOptions = computed(() => [
  { label: t('admin.logs.allActionsOption'), value: '' },
  { label: t('admin.logs.loginOption'), value: 'login' },
  { label: t('admin.logs.passwordChangeOption'), value: 'password_change' },
  { label: t('admin.logs.emailChangeOption'), value: 'email_change' },
])

const { rowsPerPage } = useTableRowsPerPage(300)

onMounted(() => {
  setLast24Hours()
  loadAll()
})

async function loadAll() {
  loading.value = true
  try {
    const params = buildParams()
    const [statsResponse, logsResponse] = await Promise.all([
      getActionLogStats(params),
      getActionLogs({ ...params, limit: 500, offset: 0 }),
    ])
    stats.value = statsResponse.data
    logs.value = logsResponse.data.logs
    total.value = logsResponse.data.total
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || t('admin.logs.failedLoad'))
  } finally {
    loading.value = false
  }
}

function buildParams() {
  const params: Record<string, string> = {}
  if (startInput.value) {
    params.start = new Date(startInput.value).toISOString()
  }
  if (endInput.value) {
    params.end = new Date(endInput.value).toISOString()
  }
  if (actionFilter.value) {
    params.action_type = actionFilter.value
  }
  if (userQuery.value) {
    params.user_query = userQuery.value.trim()
  }
  return params
}

function setLast24Hours() {
  const now = new Date()
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  startInput.value = toLocalInputValue(start)
  endInput.value = toLocalInputValue(now)
}

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

function formatDateTime(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function formatAction(value: string) {
  const match = actionOptions.value.find((option) => option.value === value)
  return match?.label || value
}

function actionClass(value: string) {
  return value.replace('_', '-')
}

function formatMetadata(value: ActionLogEntry['metadata']) {
  if (!value) return '-'
  try {
    return JSON.stringify(value)
  } catch {
    return '-'
  }
}
</script>

<style scoped>
.admin-logs {
  max-width: 95rem;
  margin: 2rem auto;
  padding: 0 1rem 2rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filters-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  margin-bottom: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.filters-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.period-summary {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.2rem;
  color: #2563eb;
}

.stat-icon.login {
  color: #2563eb;
}

.stat-icon.password {
  color: #b45309;
}

.stat-icon.email {
  color: #7c3aed;
}

.stat-icon.users {
  color: #059669;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
}

.table-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.table-header h3 {
  margin: 0;
}

.table-total {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.action-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #e0f2fe;
  color: #0369a1;
}

.action-pill.password-change {
  background: #fef3c7;
  color: #b45309;
}

.action-pill.email-change {
  background: #ede9fe;
  color: #7c3aed;
}

.muted {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

@media (max-width: 48rem) {
  .table-card {
    padding: 1rem;
  }
}
</style>
