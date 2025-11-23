<template>
  <div class="my-account">
    <h2>My account</h2>
    <div class="account-grid">
      <div class="card stats-card">
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
      </div>
      <section class="card main-card">
        <h3>Change email</h3>
        <div class="form-row">
          <label for="email">Email</label>
          <div class="email-input-wrapper">
            <InputText id="email" v-model="email" type="email" :disabled="pendingEmailChange" />
          </div>
          <div v-if="!pendingEmailChange">
          <span v-if="userStore.user?.email_verified" class="verification-badge verified">
            <i class="pi pi-check-circle"></i> Verified
          </span>
          <span v-else class="verification-badge unverified">
            <i class="pi pi-exclamation-circle"></i> Not verified
          </span>
          </div>
          <p v-if="email && !isEmailValid" class="error-text">Please enter a valid email address.</p>
          <p v-if="pendingEmailChange" class="warning-text">
            <i class="pi pi-clock"></i> Email change pending. Please check your new email address ({{ pendingNewEmail
            }}) for a confirmation link.
          </p>
          <p v-else-if="!userStore.user?.email_verified" class="info-text">
            <i class="pi pi-info-circle"></i> Please check your email inbox for a verification link.
          </p>
        </div>
        <div class="actions">
          <Button label="Save email" icon="pi pi-check" @click="saveEmail"
            :disabled="!email || !isEmailValid || saving || pendingEmailChange" />
        </div>
      </section>
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
const pendingEmailChange = ref(false)
const pendingNewEmail = ref('')
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
    const response = await updateEmail({ email: email.value })
    const message = response.data?.message || 'Email update requested'

    // If the response indicates a confirmation is needed
    if (message.toLowerCase().includes('check your') || message.toLowerCase().includes('confirm')) {
      pendingEmailChange.value = true
      pendingNewEmail.value = email.value
      showSuccessToast('Confirmation Required', message)

      // Reset email to current one
      email.value = userStore.user?.email || ''
    } else {
      showSuccessToast('Success', message)
      await userStore.fetchUser()
    }
  } catch (e: any) {
    const errorMsg = e?.response?.data?.error || 'Failed to update email'
    showErrorToast(errorMsg)
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
.card {
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.2);
}

.my-account {
  max-width: 45rem;
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

.info-text {
  color: #2563eb;
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
}

.warning-text {
  color: #d97706;
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.email-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.email-input-wrapper .p-inputtext {
  flex: 1;
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.verification-badge.verified {
  background: #d1fae5;
  color: #065f46;
}

.verification-badge.unverified {
  background: #fee2e2;
  color: #991b1b;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
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
  border-bottom: 0.0625rem solid rgba(0, 0, 0, 0.04);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #555;
  font-weight: 600
}

.stat-value {
  font-weight: 700;
  font-size: 1.1rem
}

@media (max-width: 56.25rem) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
