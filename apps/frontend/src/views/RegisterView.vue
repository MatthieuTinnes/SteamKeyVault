<template>
  <div class="register-container">
    <Card class="register-card">
      <template #title><h2 class="register-title">{{ t('auth.register.title') }}</h2></template>
      <template #content>
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="email">{{ t('auth.register.email') }}</label>
            <InputText id="email" v-model="email" type="email" required class="w-full" />
          </div>
          <div class="form-group">
            <label for="username">{{ t('auth.register.username') }}</label>
            <InputText id="username" v-model="username" type="text" required class="w-full" />
          </div>
          <div class="form-group">
            <label for="password">{{ t('auth.register.password') }}</label>
            <Password id="password" v-model="password" :feedback="false" toggleMask required class="w-full" inputClass="w-full" />
            <small class="password-requirements">
              {{ t('auth.register.passwordRequirements') }}
            </small>
          </div>
          <div class="form-group">
            <label for="confirmPassword">{{ t('auth.register.confirmPassword') }}</label>
            <Password id="confirmPassword" v-model="confirmPassword" :feedback="false" toggleMask required class="w-full" inputClass="w-full" />
          </div>
          <div v-if="turnstileEnabled" class="form-group">
            <div id="turnstile-register"></div>
            <small v-if="!turnstileReady" class="password-requirements">{{ t('auth.register.errors.captchaRequired') }}</small>
          </div>
          <Button type="submit" :label="t('auth.register.submit')" class="w-full mt-4" :disabled="turnstileEnabled && !turnstileToken" />
          <Message v-if="error" severity="error" class="mt-4">{{ error }}</Message>
          <Message v-if="success" severity="success" class="mt-4">{{ success }}</Message>
          
          <div class="login-link mt-4">
            <span>{{ t('auth.register.hasAccount') }}</span>
            <Button :label="t('auth.register.login')" link size="small" @click="goToLogin" />
          </div>
        </form>
      </template>
    </Card>

    <Dialog v-model:visible="showRecoveryDialog" :header="t('auth.recovery.title')" :modal="true" :style="{ width: 'min(36rem, 92vw)' }">
      <div class="recovery-content">
        <p class="recovery-warning">
          {{ t('auth.recovery.warning') }}
        </p>
        <div class="recovery-phrase">{{ recoveryPhrase }}</div>
        <div class="recovery-actions">
          <Button :label="t('auth.recovery.copy')" icon="pi pi-copy" @click="copyRecoveryPhrase" />
          <Button :label="t('auth.recovery.saved')" icon="pi pi-check" severity="success" @click="confirmRecoverySaved" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../api/auth'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import { deriveKeyFromPassword, generateMasterKeyBytes, generateRecoveryPhrase, generateSalt, getDefaultKdfParams, wrapMasterKey } from '@/utils/crypto'
import { validatePasswordStrength } from '@/utils/passwordValidation'
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { useI18n } from 'vue-i18n'
import { TURNSTILE_SITE_KEY } from '@/api/apiHelper'

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, any>) => string
      reset: (widgetId: string) => void
    }
  }
}

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const router = useRouter()
const toast = useToast()
const recoveryPhrase = ref('')
const showRecoveryDialog = ref(false)
const { t, locale } = useI18n()

const turnstileEnabled = !!TURNSTILE_SITE_KEY
const turnstileToken = ref('')
const turnstileReady = ref(false)
const turnstileWidgetId = ref<string | null>(null)

onMounted(async () => {
  if (!turnstileEnabled) return
  await nextTick()
  try {
    await loadTurnstile()
    renderTurnstile()
  } catch (err) {
    console.error('Turnstile load error:', err)
    turnstileReady.value = false
  }
})

async function loadTurnstile() {
  if (window.turnstile) { turnstileReady.value = true; return }
  await new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('turnstile-script') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile')))
      return
    }
    const script = document.createElement('script')
    script.id = 'turnstile-script'
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(script)
  })
  turnstileReady.value = true
}

function renderTurnstile() {
  if (!turnstileReady.value || !window.turnstile) return
  const el = document.getElementById('turnstile-register')
  if (el && !turnstileWidgetId.value) {
    turnstileWidgetId.value = window.turnstile.render(el, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => { turnstileToken.value = token },
      'expired-callback': () => { turnstileToken.value = '' },
      'error-callback': () => { turnstileToken.value = '' },
      action: 'register'
    })
  }
}

function resetTurnstile() {
  if (!window.turnstile || !turnstileWidgetId.value) return
  window.turnstile.reset(turnstileWidgetId.value)
  turnstileToken.value = ''
}

const handleRegister = async () => {
  error.value = ''
  success.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = t('auth.register.errors.passwordMismatch')
    return
  }

  if (turnstileEnabled && !turnstileToken.value) {
    error.value = t('auth.register.errors.captchaRequired')
    return
  }
  
  // Validate password strength
  const validation = validatePasswordStrength(password.value)
  if (!validation.isValid) {
    error.value = validation.errors.join('. ')
    return
  }
  
  try {
    const kdfParams = getDefaultKdfParams()
    const mkSalt = generateSalt()
    const rkSalt = generateSalt()
    const masterKeyBytes = generateMasterKeyBytes()
    const recovery = generateRecoveryPhrase(12)

    const userKey = await deriveKeyFromPassword(password.value, mkSalt, kdfParams)
    const recoveryKey = await deriveKeyFromPassword(recovery, rkSalt, kdfParams)
    const wrappedMkPassword = await wrapMasterKey(masterKeyBytes, userKey)
    const wrappedMkRecovery = await wrapMasterKey(masterKeyBytes, recoveryKey)

    await registerUser({
      email: email.value,
      username: username.value,
      password: password.value,
      preferred_language: locale.value,
      wrapped_mk_password: wrappedMkPassword,
      wrapped_mk_recovery: wrappedMkRecovery,
      mk_salt: mkSalt,
      rk_salt: rkSalt,
      kdf_iterations: kdfParams.iterations,
      kdf_hash: kdfParams.hash,
      turnstile_token: turnstileToken.value || undefined
    })

    recoveryPhrase.value = recovery
    showRecoveryDialog.value = true
    success.value = t('auth.register.success')
  } catch (err: any) {
    error.value = err?.response?.data?.error || t('auth.register.errors.registrationFailed')
    resetTurnstile()
  }
}

function goToLogin() {
  router.push(`/${locale.value}/login`)
}

async function copyRecoveryPhrase() {
  try {
    await navigator.clipboard.writeText(recoveryPhrase.value)
    toast.add({ severity: 'success', summary: t('auth.recovery.copied'), detail: t('auth.recovery.copiedDetail'), life: 2000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('auth.recovery.copyFailed'), life: 2000 })
  }
}

function confirmRecoverySaved() {
  showRecoveryDialog.value = false
  setTimeout(() => router.push(`/${locale.value}/login`), 500)
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 5rem);
  background: var(--bg-secondary);
  padding: 1rem;
}

.register-card {
  width: 100%;
  max-width: 25rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.register-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-weight: 700;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.password-requirements {
  color: var(--text-secondary);
  font-size: 0.75rem;
  line-height: 1.4;
  margin-top: 0.25rem;
  display: block;
}

.w-full {
  width: 100%;
}

.mt-4 {
  margin-top: 1rem;
}

.login-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.recovery-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recovery-warning {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.recovery-phrase {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px dashed var(--border-color);
  background: var(--bg-secondary);
  font-family: monospace;
  font-size: 0.95rem;
  line-height: 1.4;
  word-spacing: 0.3rem;
}

.recovery-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Override PrimeVue styles if needed */
:deep(.p-card-body) {
  padding: 2rem;
}

:deep(.p-card-content) {
  padding: 0;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}
</style>
