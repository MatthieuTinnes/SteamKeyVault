<template>
  <div class="reset-container">
    <Card class="reset-card">
      <template #title><h2 class="reset-title">{{ t('auth.reset.title') }}</h2></template>
      <template #content>
        <div v-if="loading" class="loading-state">{{ t('auth.reset.validating') }}</div>
        <div v-else-if="loadError" class="error-state">
          <Message severity="error">{{ loadError }}</Message>
          <div class="login-link mt-4">
            <Button :label="t('common.backToLogin')" link size="small" @click="goToLogin" />
          </div>
        </div>
        <form v-else @submit.prevent="handleReset" class="reset-form">
          <div class="form-group">
            <label for="recovery">{{ t('auth.reset.recoveryPhrase') }}</label>
            <InputText id="recovery" v-model="recoveryPhrase" type="text" class="w-full" :placeholder="t('auth.reset.recoveryPlaceholder')" />
          </div>
          <div class="form-group">
            <label for="newPassword">{{ t('auth.reset.newPassword') }}</label>
            <Password id="newPassword" v-model="newPassword" :feedback="true" toggleMask class="w-full" inputClass="w-full" />
            <small class="password-requirements">
              {{ t('account.security.passwordRequirements') }}
            </small>
          </div>
          <div class="form-group">
            <label for="confirmPassword">{{ t('auth.reset.confirmPassword') }}</label>
            <Password id="confirmPassword" v-model="confirmPassword" :feedback="false" toggleMask class="w-full" inputClass="w-full" :class="{ 'p-invalid': confirmPassword && newPassword !== confirmPassword }" />
          </div>
          <Button type="submit" :label="t('auth.reset.submit')" class="w-full mt-4" :loading="submitting" :disabled="!canSubmit" />
          <Message v-if="error" severity="error" class="mt-4">{{ error }}</Message>
          <Message v-if="success" severity="success" class="mt-4">{{ t('auth.reset.success') }}</Message>
          <div class="login-link mt-4">
            <Button :label="t('common.backToLogin')" link size="small" @click="goToLogin" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { fetchResetPasswordInfo, resetPassword } from '@/api/auth'
import { deriveKeyFromPassword, unwrapMasterKey, wrapMasterKey } from '@/utils/crypto'
import { validatePasswordStrength } from '@/utils/passwordValidation'
import { showErrorToast, showSuccessToast } from '@/utils/toast'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const token = ref('')
const loading = ref(true)
const loadError = ref('')
const submitting = ref(false)
const success = ref(false)
const error = ref('')
const { t } = useI18n()

const recoveryPhrase = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const resetInfo = ref<{ wrapped_mk_recovery: string; rk_salt: string; mk_salt: string; kdf_iterations: number; kdf_hash: string } | null>(null)

const canSubmit = computed(() => {
  return recoveryPhrase.value.trim().length > 0 && newPassword.value && newPassword.value === confirmPassword.value
})

onMounted(async () => {
  token.value = String(route.query.token || '')
  if (!token.value) {
    loadError.value = t('auth.reset.invalidLink')
    loading.value = false
    return
  }
  try {
    resetInfo.value = await fetchResetPasswordInfo(token.value)
  } catch (e: any) {
    loadError.value = e?.response?.data?.error || t('auth.reset.invalidOrExpired')
  } finally {
    loading.value = false
  }
})

async function handleReset() {
  if (!resetInfo.value) return
  error.value = ''
  success.value = false
  
  // Validate password strength
  const validation = validatePasswordStrength(newPassword.value)
  if (!validation.isValid) {
    error.value = validation.errors.join('. ')
    return
  }
  
  submitting.value = true
  try {
    const phrase = recoveryPhrase.value.trim().toLowerCase()
    const recoveryKey = await deriveKeyFromPassword(phrase, resetInfo.value.rk_salt, {
      iterations: resetInfo.value.kdf_iterations,
      hash: resetInfo.value.kdf_hash
    })
    const masterKeyBytes = await unwrapMasterKey(resetInfo.value.wrapped_mk_recovery, recoveryKey)
    const userKey = await deriveKeyFromPassword(newPassword.value, resetInfo.value.mk_salt, {
      iterations: resetInfo.value.kdf_iterations,
      hash: resetInfo.value.kdf_hash
    })
    const wrappedMkPassword = await wrapMasterKey(masterKeyBytes, userKey)
    await resetPassword({
      token: token.value,
      new_password: newPassword.value,
      wrapped_mk_password: wrappedMkPassword
    })
    success.value = true
    showSuccessToast(t('auth.reset.resetToastTitle'), t('auth.reset.resetToastDetail'))
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || t('auth.reset.failed')
    showErrorToast(t('auth.forgot.resetFailed'), error.value)
  } finally {
    submitting.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 5rem);
  background: var(--bg-secondary);
  padding: 1rem;
}

.reset-card {
  width: 100%;
  max-width: 28rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.reset-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-weight: 700;
}

.reset-form {
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

.loading-state {
  text-align: center;
  color: var(--text-secondary);
}

.error-state {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}
</style>
