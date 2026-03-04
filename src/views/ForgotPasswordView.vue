<template>
  <div class="forgot-container">
    <Card class="forgot-card">
      <template #title><h2 class="forgot-title">{{ t('auth.forgot.title') }}</h2></template>
      <template #content>
        <form @submit.prevent="handleSubmit" class="forgot-form">
          <div class="form-group">
            <label for="email">{{ t('auth.login.email') }}</label>
            <InputText id="email" v-model="email" type="email" required class="w-full" />
          </div>
          <div v-if="turnstileEnabled" class="form-group">
            <div id="turnstile-forgot-password"></div>
            <small v-if="!turnstileToken" class="password-requirements">{{ t('auth.register.errors.captchaRequired') }}</small>
          </div>
          <Button type="submit" :label="t('auth.forgot.sendLink')" class="w-full mt-4" :loading="submitting" :disabled="(turnstileEnabled && !turnstileToken) || submitting || success" />
          <Message v-if="success" severity="success" class="mt-4">
            {{ t('auth.forgot.success') }}
          </Message>
          <Message v-if="error" severity="error" class="mt-4">{{ error }}</Message>
          <div class="login-link mt-4">
            <Button :label="t('common.backToLogin')" link size="small" @click="goToLogin" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { forgotPassword } from '@/api/auth'
import { showErrorToast, showSuccessToast } from '@/utils/toast'
import { useI18n } from 'vue-i18n'
import { TURNSTILE_SITE_KEY } from '@/api/apiHelper'

const email = ref('')
const submitting = ref(false)
const success = ref(false)
const error = ref('')
const router = useRouter()
const { t } = useI18n()

const turnstileEnabled = !!TURNSTILE_SITE_KEY
const turnstileToken = ref('')
const turnstileWidgetId = ref<string | null>(null)

async function loadTurnstile() {
  if (window.turnstile) return
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
}

function renderTurnstile() {
  if (!window.turnstile) return
  const el = document.getElementById('turnstile-forgot-password')
  if (el && !turnstileWidgetId.value) {
    turnstileWidgetId.value = window.turnstile.render(el, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => { turnstileToken.value = token },
      'expired-callback': () => { turnstileToken.value = '' },
      'error-callback': () => { turnstileToken.value = '' },
      action: 'forgot_password',
    })
  }
}

function resetTurnstile() {
  if (window.turnstile && turnstileWidgetId.value) {
    window.turnstile.reset(turnstileWidgetId.value)
  }
  turnstileToken.value = ''
}

onMounted(async () => {
  if (!turnstileEnabled) return
  await nextTick()
  try {
    await loadTurnstile()
    renderTurnstile()
  } catch (err) {
    console.error('Turnstile load error:', err)
  }
})

async function handleSubmit() {
  error.value = ''
  success.value = false
  if (turnstileEnabled && !turnstileToken.value) {
    error.value = t('auth.register.errors.captchaRequired')
    return
  }
  submitting.value = true
  try {
    await forgotPassword(email.value, turnstileToken.value || undefined)
    success.value = true
    showSuccessToast(t('auth.forgot.emailSent'), t('auth.forgot.emailSentDetail'))
  } catch (e: any) {
    error.value = e?.response?.data?.error || t('auth.forgot.failedToSend')
    showErrorToast(t('auth.forgot.resetFailed'), error.value)
    resetTurnstile()
  } finally {
    submitting.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.forgot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 5rem);
  background: var(--bg-secondary);
  padding: 1rem;
}

.forgot-card {
  width: 100%;
  max-width: 25rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.forgot-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-weight: 700;
}

.forgot-form {
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

.w-full {
  width: 100%;
}

.mt-4 {
  margin-top: 1rem;
}

.login-link {
  display: flex;
  justify-content: center;
}

:deep(.p-card-body) {
  padding: 2rem;
}

:deep(.p-card-content) {
  padding: 0;
}
</style>
