<template>
  <div class="my-account-view">
    <div class="header">
      <h2><i class="pi pi-user"></i> {{ t('account.title') }}</h2>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <i class="pi pi-box stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('account.stats.totalGames') }}</div>
          <div class="stat-value">{{ stats.games_count ?? '-' }}</div>
        </div>
      </div>

      <div class="stat-card">
        <i class="pi pi-key stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('account.stats.totalKeys') }}</div>
          <div class="stat-value">{{ stats.keys_count ?? '-' }}</div>
        </div>
      </div>

      <div class="stat-card">
        <i :class="['pi', userStore.user?.email_verified ? 'pi-check-circle' : 'pi-exclamation-circle', 'stat-icon', userStore.user?.email_verified ? 'verified' : 'warning']"></i>
        <div class="stat-content">
          <div class="stat-label">{{ t('account.stats.accountStatus') }}</div>
          <div class="stat-value status-text">
            {{ userStore.user?.email_verified ? t('account.stats.verified') : t('account.stats.unverified') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      
      <!-- Data Management -->
      <section class="settings-card">
        <div class="card-header">
          <h3><i class="pi pi-database"></i> {{ t('account.data.title') }}</h3>
          <p class="section-desc">{{ t('account.data.desc') }}</p>
        </div>
        <div class="actions-column">
          <Button :label="t('account.data.importCsv')" icon="pi pi-upload" @click="router.push(`/${locale}/import`)" outlined class="w-full" />
          <Button :label="t('account.data.exportCsv')" icon="pi pi-download" @click="exportCsv" outlined class="w-full" />
          <Button :label="t('account.data.importJson')" icon="pi pi-upload" @click="openJsonPicker" outlined class="w-full" />
          <Button :label="t('account.data.exportJson')" icon="pi pi-download" @click="exportJson" outlined class="w-full" />
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
          <h3><i class="pi pi-envelope"></i> {{ t('account.email.title') }}</h3>
          <p class="section-desc">{{ t('account.email.desc') }}</p>
        </div>
        <div class="form-group">
          <label for="email">{{ t('account.email.label') }}</label>
          <div class="p-inputgroup">
            <InputText id="email" v-model="email" type="email" :disabled="pendingEmailChange" :placeholder="t('account.email.placeholder')" />
            <Button icon="pi pi-check" @click="saveEmail" :disabled="!email || !isEmailValid || saving || pendingEmailChange" />
          </div>
          
          <small v-if="email && !isEmailValid" class="p-error">{{ t('account.email.invalid') }}</small>
          
          <div v-if="pendingEmailChange">
            <Message severity="warn" icon="pi pi-clock" :closable="false">{{ t('account.email.pending', { email: pendingNewEmail }) }}</Message>
          </div>
          <div v-else-if="!userStore.user?.email_verified" class="unverified-alert">
             <Message severity="warn" icon="pi pi-clock" :closable="false">{{ t('account.email.unverified') }}</Message>
             <Button :label="t('account.email.resend')" icon="pi pi-send" size="small" text @click="resendVerification" :loading="resending" class="mt-2" />
          </div>
        </div>
      </section>

      <!-- Security Settings -->
      <section class="settings-card">
        <div class="card-header">
          <h3><i class="pi pi-lock"></i> {{ t('account.security.title') }}</h3>
          <p class="section-desc">{{ t('account.security.desc') }}</p>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label for="current">{{ t('account.security.currentPassword') }}</label>
            <Password id="current" v-model="currentPassword" :feedback="false" toggleMask inputClass="w-full" />
          </div>
          <div class="form-group">
            <label for="new">{{ t('account.security.newPassword') }}</label>
            <Password id="new" v-model="newPassword" :feedback="false" toggleMask inputClass="w-full" />
            <small class="password-requirements">
              {{ t('account.security.passwordRequirements') }}
            </small>
          </div>
          <div class="form-group">
            <label for="confirm">{{ t('account.security.confirmPassword') }}</label>
            <Password id="confirm" v-model="confirmPassword" :feedback="false" toggleMask inputClass="w-full" :class="{'p-invalid': confirmPassword && newPassword !== confirmPassword}" />
          </div>
        </div>
        <div class="actions-footer">
          <Button :label="t('account.security.updatePassword')" icon="pi pi-save" @click="changePwd" :disabled="!canChange || saving" :loading="saving" />
        </div>
      </section>

      <!-- Support -->
      <section class="settings-card">
        <div class="card-header">
          <h3><i class="pi pi-question-circle"></i> {{ t('account.support.title') }}</h3>
          <p class="section-desc">{{ t('account.support.desc') }}</p>
        </div>
        <div class="actions-column">
          <a href="mailto:support@steamkeyvault.com" class="support-link">
            <Button :label="t('account.support.contactButton')" icon="pi pi-envelope" outlined class="w-full" />
          </a>
        </div>
      </section>

      <section class="settings-card">
        <div class="card-header">
          <h3><i class="pi pi-sliders-h"></i> {{ t('account.preferences.title') }}</h3>
          <p class="section-desc">{{ t('account.preferences.desc') }}</p>
        </div>
        <div class="form-group">
          <label for="language">{{ t('account.preferences.language') }}</label>
          <Dropdown
            id="language"
            v-model="selectedLocale"
            :options="localeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            @change="onLocaleChange"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Password from 'primevue/password'
import Dropdown from 'primevue/dropdown'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCryptoStore } from '@/stores/crypto'
import { updateEmail, changePassword, fetchUserStats, resendVerificationEmail, updatePreferences } from '@/api/auth'
import { exportUserGamesCsv, exportUserGamesJson, importUserGamesJson } from '@/api/games'
import { showErrorToast, showSuccessToast } from '@/utils/toast'
import Message from 'primevue/message';
import { deriveKeyFromPassword, wrapMasterKey } from '@/utils/crypto'
import { validatePasswordStrength } from '@/utils/passwordValidation'
import { MAX_IMPORT_BYTES } from '@/utils/importLimits'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'

const userStore = useUserStore()
const cryptoStore = useCryptoStore()
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
const { t, locale } = useI18n()
const selectedLocale = ref(locale.value)
const localeOptions = computed(() => [
  { label: t('locale.en'), value: 'en' },
  { label: t('locale.fr'), value: 'fr' }
])

onMounted(async () => {
  if (!userStore.user) {
    await userStore.fetchUser()
  }
  email.value = userStore.user?.email || ''
  const storedLocale = userStore.user?.preferred_language
  if (storedLocale && storedLocale !== locale.value) {
    setLocale(storedLocale as 'en' | 'fr')
  }
  await loadStats()
})

watch(locale, (value) => {
  selectedLocale.value = value
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
    const message = response.data?.message || t('account.toasts.emailUpdateRequested')

    // If the response indicates a confirmation is needed
    if (message.toLowerCase().includes('check your') || message.toLowerCase().includes('confirm')) {
      pendingEmailChange.value = true
      pendingNewEmail.value = email.value
      showSuccessToast(t('account.toasts.confirmationRequired'), message)

      // Reset email to current one
      email.value = userStore.user?.email || ''
    } else {
      showSuccessToast(t('account.toasts.success'), message)
      await userStore.fetchUser()
    }
  } catch (e: any) {
    const errorMsg = e?.response?.data?.error || t('account.toasts.failedUpdateEmail')
    showErrorToast(errorMsg)
  } finally {
    saving.value = false
  }
}

async function changePwd() {
  if (!canChange.value) return showErrorToast(t('account.toasts.invalidData'), t('account.toasts.checkPasswordFields'))
  
  // Validate password strength
  const validation = validatePasswordStrength(newPassword.value)
  if (!validation.isValid) {
    showErrorToast(t('account.toasts.invalidPassword'), validation.errors.join('. '))
    return
  }
  
  saving.value = true
  try {
    if (!cryptoStore.masterKeyBytes || !cryptoStore.mkSalt || !cryptoStore.kdfParams) {
      throw new Error(t('account.toasts.missingEncryptionContext'))
    }
    const newUserKey = await deriveKeyFromPassword(newPassword.value, cryptoStore.mkSalt, cryptoStore.kdfParams)
    const wrappedMkPassword = await wrapMasterKey(cryptoStore.masterKeyBytes, newUserKey)
    await changePassword({
      current_password: currentPassword.value,
      new_password: newPassword.value,
      wrapped_mk_password: wrappedMkPassword
    })
    showSuccessToast(t('account.toasts.success'), t('account.toasts.passwordChanged'))
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    showErrorToast(t('account.toasts.passwordUpdateFailed'), e instanceof Error ? e.message : t('common.unknownError'))
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
    showErrorToast(t('account.toasts.failedAccountStats'))
  } finally {
    statsLoading.value = false
  }
}

async function resendVerification() {
  resending.value = true
  try {
    await resendVerificationEmail()
    showSuccessToast(t('account.toasts.emailSent'), t('account.toasts.verificationResent'))
  } catch (e: any) {
    const errorMsg = e?.response?.data?.error || t('account.toasts.failedResendEmail')
    showErrorToast(errorMsg)
  } finally {
    resending.value = false
  }
}

async function exportCsv() {
  try {
    const { blob, filename } = await exportUserGamesCsv()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
    showSuccessToast(t('account.toasts.export'), t('account.toasts.csvDownloaded', { filename }))
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
  if (file.size > MAX_IMPORT_BYTES) {
    showErrorToast(t('account.toasts.fileTooLarge'), t('account.toasts.maxFileSize'))
    return
  }
  try {
    const res = await importUserGamesJson(file)
    const data = res.data || {}
    const gamesCreated = data.games_created ?? 0
    const keysCreated = data.keys_created ?? 0
    showSuccessToast(t('account.toasts.importJson'), t('account.toasts.gamesKeysCreated', { games: gamesCreated, keys: keysCreated }))
  } catch (e: any) {
    showErrorToast(e?.response?.data?.error || t('account.toasts.failedImportJson'))
  }
}

async function exportJson() {
  try {
    const { blob, filename } = await exportUserGamesJson()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
    showSuccessToast(t('account.toasts.export'), t('account.toasts.jsonDownloaded', { filename }))
  } catch (e: any) {
    showErrorToast(e?.response?.data?.error || e.message || String(e))
  }
}

async function onLocaleChange(event: { value: string }) {
  const nextLocale = event.value
  selectedLocale.value = nextLocale
  setLocale(nextLocale as 'en' | 'fr')
  if (!userStore.user) return
  try {
    await updatePreferences({ preferred_language: nextLocale })
    userStore.setUser({ ...userStore.user, preferred_language: nextLocale })
  } catch (e: any) {
    const errorMsg = e?.response?.data?.error || t('common.unknownError')
    showErrorToast(t('common.error'), errorMsg)
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

.password-requirements {
  color: var(--text-secondary);
  font-size: 0.75rem;
  line-height: 1.4;
  margin-top: 0.25rem;
  display: block;
}

.support-link {
  text-decoration: none;
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
