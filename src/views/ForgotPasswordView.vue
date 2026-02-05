<template>
  <div class="forgot-container">
    <Card class="forgot-card">
      <template #title><h2 class="forgot-title">Forgot Password</h2></template>
      <template #content>
        <form @submit.prevent="handleSubmit" class="forgot-form">
          <div class="form-group">
            <label for="email">Email</label>
            <InputText id="email" v-model="email" type="email" required class="w-full" />
          </div>
          <Button type="submit" label="Send Reset Link" class="w-full mt-4" :loading="submitting" />
          <Message v-if="success" severity="success" class="mt-4">
            If an account exists for this email, a reset link has been sent.
          </Message>
          <Message v-if="error" severity="error" class="mt-4">{{ error }}</Message>
          <div class="login-link mt-4">
            <Button label="Back to Login" link size="small" @click="goToLogin" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { forgotPassword } from '@/api/auth'
import { showErrorToast, showSuccessToast } from '@/utils/toast'

const email = ref('')
const submitting = ref(false)
const success = ref(false)
const error = ref('')
const router = useRouter()

async function handleSubmit() {
  error.value = ''
  success.value = false
  submitting.value = true
  try {
    await forgotPassword(email.value)
    success.value = true
    showSuccessToast('Email sent', 'If the account exists, a reset link was sent.')
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Failed to send reset email.'
    showErrorToast('Reset failed', error.value)
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
