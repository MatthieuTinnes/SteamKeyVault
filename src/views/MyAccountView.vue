<template>
  <div class="my-account">
    <h2>My account</h2>
    <div class="account-grid">
      <section class="card main-card">
      <h3>Change email</h3>
      <div class="form-row">
        <label for="email">Email</label>
        <InputText id="email" v-model="email" type="email" />
        <p v-if="email && !isEmailValid" class="error-text">Please enter a valid email address.</p>
      </div>
      <div class="actions">
        <Button label="Save email" icon="pi pi-check" @click="saveEmail" :disabled="!email || !isEmailValid || saving" />
      </div>
      </section>

      <aside class="card stats-card">
        <h3>Account stats</h3>
        <div class="stat-row">
          <div class="stat-label">Total games</div>
          <div class="stat-value">{{ stats.games_count ?? '-' }}</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Total keys</div>
          <div class="stat-value">{{ stats.keys_count ?? '-' }}</div>
        </div>
        <div style="margin-top:0.75rem; display:flex; gap:0.5rem; justify-content:center;">
          <Button label="Import games" icon="pi pi-upload" @click="router.push('/import')" />
          <Button label="Export games" icon="pi pi-download" class="p-button-secondary" @click="exportCsv" />
        </div>
      </aside>

      <section class="card">
      <h3>Change password</h3>
      <div class="form-row">
        <label for="current">Current password</label>
        <InputText id="current" v-model="currentPassword" type="password" />
      </div>
      <div class="form-row">
        <label for="new">New password</label>
        <InputText id="new" v-model="newPassword" type="password" />
      </div>
      <div class="form-row">
        <label for="confirm">Confirm new password</label>
        <InputText id="confirm" v-model="confirmPassword" type="password" />
      </div>
      <div class="actions">
        <Button label="Change password" icon="pi pi-key" @click="changePwd" :disabled="!canChange || saving" />
      </div>
    </section>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { updateEmail, changePassword, fetchUserStats } from '@/api/auth'
import { exportUserGamesCsv } from '@/api/games'
import { showErrorToast, showSuccessToast } from '@/utils/toast'

const userStore = useUserStore()
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const saving = ref(false)
const stats = ref<{ games_count?: number; keys_count?: number }>({})
const statsLoading = ref(false)
const router = useRouter()

onMounted(async () => {
  if (!userStore.user) {
    await userStore.fetchUser()
  }
  email.value = userStore.user?.email || ''
  await loadStats()
})

const canChange = computed(() => {
  return currentPassword.value && newPassword.value && newPassword.value === confirmPassword.value
})

const isEmailValid = computed(() => {
  const e = (email.value || '').trim()
  if (!e) return false
  // simple but practical email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(e)
})

async function saveEmail() {
  if (!email.value) return
  saving.value = true
  try {
    await updateEmail({ email: email.value })
    showSuccessToast('Success', 'Email updated')
    await userStore.fetchUser()
  } catch (e) {
    showErrorToast('Failed to update email')
  } finally {
    saving.value = false
  }
}

async function changePwd() {
  if (!canChange.value) return showErrorToast('Invalid data', 'Please check the password fields')
  saving.value = true
  try {
    await changePassword({ current_password: currentPassword.value, new_password: newPassword.value })
    showSuccessToast('Success', 'Password changed')
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
  } finally {
    saving.value = false
  }
}

async function loadStats() {
  statsLoading.value = true
  try {
    const res = await fetchUserStats()
    stats.value = res.data || {}
  } catch (e) {
    showErrorToast('Failed to load account stats')
  } finally {
    statsLoading.value = false
  }
}

async function exportCsv() {
  try {
    const res = await exportUserGamesCsv()
    const blob = res.data
    // Use server-provided 'x-filename' header only
    let filename = 'user_games.csv'
    const headers = res.headers || {}
    if (headers['X-Filename']) {
      filename = headers['X-Filename']
    }
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
    showSuccessToast('Export', `CSV downloaded: ${filename}`)
  } catch (e: any) {
    showErrorToast(e?.response?.data?.error || e.message || String(e))
  }
}
</script>

<style scoped>
.card{
  border-radius: 8px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  margin-bottom: 1.25rem;
}
.my-account {
  max-width: 720px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.form-row label {
  font-weight: 600;
  font-size: 0.95rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
.error-text {
  color: #dc2626;
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1rem;
  align-items: start;
}

.stats-card {
  background: #fff;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.stat-row:last-child { border-bottom: none; }
.stat-label { color: #555; font-weight: 600 }
.stat-value { font-weight: 700; font-size: 1.1rem }

@media (max-width: 900px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
