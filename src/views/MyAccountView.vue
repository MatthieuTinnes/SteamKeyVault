<template>
  <div class="my-account-view">
    <div class="header">
      <h2><i class="pi pi-user"></i> My Account</h2>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <i class="pi pi-box stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">Total Games</div>
          <div class="stat-value">{{ stats.games_count ?? '-' }}</div>
        </div>
      </div>

      <div class="stat-card">
        <i class="pi pi-key stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">Total Keys</div>
          <div class="stat-value">{{ stats.keys_count ?? '-' }}</div>
        </div>
      </div>

      <div class="stat-card">
        <i :class="['pi', userStore.user?.email_verified ? 'pi-check-circle' : 'pi-exclamation-circle', 'stat-icon', userStore.user?.email_verified ? 'verified' : 'warning']"></i>
        <div class="stat-content">
          <div class="stat-label">Account Status</div>
          <div class="stat-value status-text">
            {{ userStore.user?.email_verified ? 'Verified' : 'Unverified' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      
      <!-- Data Management -->
      <section class="settings-card">
        <div class="card-header">
          <h3><i class="pi pi-database"></i> Data Management</h3>
          <p class="section-desc">Import or export your game library data.
            CSV format contains game names and keys separated by semicolons. 
            JSON format follows the SteamKeyVault schema.</p>
        </div>
        <div class="actions-column">
          <Button label="Import CSV" icon="pi pi-upload" @click="router.push('/import')" outlined class="w-full" />
          <Button label="Export CSV" icon="pi pi-download" @click="exportCsv" outlined class="w-full" />
          <Button label="Import JSON (SteamKeyVault)" icon="pi pi-upload" @click="openJsonPicker" outlined class="w-full" />
          <Button label="Export JSON (SteamKeyVault)" icon="pi pi-download" @click="exportJson" outlined class="w-full" />
          <input
            ref="jsonFileInput"
            type="file"
            accept=".json,application/json"
            @change="onJsonFileChange"
            style="display:none"
          />
        </div>
      </section>

      <!-- Email Settings -->
      <section class="settings-card">
        <div class="card-header">
          <h3><i class="pi pi-envelope"></i> Email Settings</h3>
          <p class="section-desc">Manage your email address and verification.</p>
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="p-inputgroup">
            <InputText id="email" v-model="email" type="email" :disabled="pendingEmailChange" placeholder="your@email.com" />
            <Button icon="pi pi-check" @click="saveEmail" :disabled="!email || !isEmailValid || saving || pendingEmailChange" />
          </div>
          
          <small v-if="email && !isEmailValid" class="p-error">Please enter a valid email address.</small>
          
          <div v-if="pendingEmailChange">
            <Message severity="warn" icon="pi pi-clock" :closable="false">Change pending. Check {{ pendingNewEmail }} for confirmation.</Message>
          </div>
          <div v-else-if="!userStore.user?.email_verified" class="unverified-alert">
             <Message severity="warn" icon="pi pi-clock" :closable="false">Please check your inbox to verify your email.</Message>
             <Button label="Resend Email" icon="pi pi-send" size="small" text @click="resendVerification" :loading="resending" class="mt-2" />
          </div>
        </div>
      </section>

      <!-- Security Settings -->
      <section class="settings-card">
        <div class="card-header">
          <h3><i class="pi pi-lock"></i> Security</h3>
          <p class="section-desc">Update your password to keep your account secure.</p>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label for="current">Current Password</label>
            <Password id="current" v-model="currentPassword" :feedback="false" toggleMask inputClass="w-full" />
          </div>
          <div class="form-group">
            <label for="new">New Password</label>
            <Password id="new" v-model="newPassword" :feedback="true" toggleMask inputClass="w-full" />
          </div>
          <div class="form-group">
            <label for="confirm">Confirm Password</label>
            <Password id="confirm" v-model="confirmPassword" :feedback="false" toggleMask inputClass="w-full" :class="{'p-invalid': confirmPassword && newPassword !== confirmPassword}" />
          </div>
        </div>
        <div class="actions-footer">
          <Button label="Update Password" icon="pi pi-save" @click="changePwd" :disabled="!canChange || saving" :loading="saving" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Password from 'primevue/password'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { updateEmail, changePassword, fetchUserStats, resendVerificationEmail } from '@/api/auth'
import { exportUserGamesCsv, exportUserGamesJson, importUserGamesJson } from '@/api/games'
import { showErrorToast, showSuccessToast } from '@/utils/toast'
import Message from 'primevue/message';

const userStore = useUserStore()
const email = ref('')
const pendingEmailChange = ref(false)
const pendingNewEmail = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const saving = ref(false)
const resending = ref(false)
const stats = ref<{ games_count?: number; keys_count?: number }>({})
const statsLoading = ref(false)
const router = useRouter()
const jsonFileInput = ref<HTMLInputElement | null>(null)

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

async function resendVerification() {
  resending.value = true
  try {
    await resendVerificationEmail()
    showSuccessToast('Email Sent', 'Verification email has been resent.')
  } catch (e: any) {
    const errorMsg = e?.response?.data?.error || 'Failed to resend email'
    showErrorToast(errorMsg)
  } finally {
    resending.value = false
  }
}

async function exportCsv() {
  try {
    const res = await exportUserGamesCsv()
    const blob = res.data
    // Use server-provided 'x-filename' header only
    let filename = 'user_games.csv'
    const headers = res.headers || {}
    if (headers['x-filename']) {
      filename = headers['x-filename']
    } else if (headers['X-Filename']) {
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

function openJsonPicker() {
  jsonFileInput.value?.click()
}

function onJsonFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  importJson(target.files[0])
  target.value = ''
}

async function importJson(file: File) {
  try {
    const res = await importUserGamesJson(file)
    const data = res.data || {}
    const gamesCreated = data.games_created ?? 0
    const keysCreated = data.keys_created ?? 0
    showSuccessToast('Import JSON', `Games created: ${gamesCreated}, Keys created: ${keysCreated}`)
  } catch (e: any) {
    showErrorToast(e?.response?.data?.error || 'Failed to import JSON')
  }
}

async function exportJson() {
  try {
    const res = await exportUserGamesJson()
    const blob = res.data
    let filename = 'steamkeyvault_export.json'
    const headers = res.headers || {}
    if (headers['x-filename']) {
      filename = headers['x-filename']
    } else if (headers['X-Filename']) {
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
    showSuccessToast('Export', `JSON downloaded: ${filename}`)
  } catch (e: any) {
    showErrorToast(e?.response?.data?.error || e.message || String(e))
  }
}
</script>

<style scoped>
.my-account-view {
  max-width: 75rem;
  margin: auto;
  padding: 0 1rem;
}

.header {
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-0.125rem);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
  background: var(--bg-tertiary);
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.verified {
  color: #059669;
  background: #ecfdf5;
}

.stat-icon.warning {
  color: #d97706;
  background: #fffbeb;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-value.status-text {
  font-size: 1.25rem;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.settings-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.settings-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin: 0;
}

.actions-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.5rem;
}

.actions-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.p-inputgroup {
  display: flex;
}

.p-inputgroup .p-inputtext {
  flex: 1;
}

.p-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.status-message {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-message.warning {
  color: #ffffff;
  background-color: #b45309;
}

.status-message.info {
  color: #ffffff;
  background-color: #1d4fd8;
}

.w-full {
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 48rem) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
