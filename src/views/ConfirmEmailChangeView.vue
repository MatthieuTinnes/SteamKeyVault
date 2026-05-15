<template>
  <div class="confirm-email-container">
    <div class="confirm-card">
      <div v-if="loading" class="status-content">
        <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: #2563eb;"></i>
        <h2>{{ t('auth.confirmEmail.confirmingTitle') }}</h2>
        <p>{{ t('auth.confirmEmail.confirmingDesc') }}</p>
      </div>

      <div v-else-if="success" class="status-content success">
        <i class="pi pi-check-circle" style="font-size: 3rem; color: #059669;"></i>
        <h2>{{ t('auth.confirmEmail.successTitle') }}</h2>
        <p>{{ message }}</p>
        <p>{{ t('auth.confirmEmail.successDesc') }}</p>
        <Button :label="t('auth.confirmEmail.goToAccount')" icon="pi pi-user" @click="router.push(`/${locale}/my-account`)" class="mt-3" />
      </div>

      <div v-else class="status-content error">
        <i class="pi pi-times-circle" style="font-size: 3rem; color: #dc2626;"></i>
        <h2>{{ t('auth.confirmEmail.failedTitle') }}</h2>
        <p>{{ errorMessage }}</p>
        <Button :label="t('common.backToHome')" icon="pi pi-home" @click="router.push(`/${locale}/`)" class="mt-3" severity="secondary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { confirmEmailChange } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const success = ref(false)
const message = ref('')
const { t, locale } = useI18n()
const errorMessage = ref(t('auth.confirmEmail.failedDefault'))

onMounted(async () => {
  const token = route.query.token as string
  
  if (!token) {
    loading.value = false
    errorMessage.value = t('auth.confirmEmail.noToken')
    return
  }

  try {
    const response = await confirmEmailChange(token)
    success.value = true
    message.value = response.data.message || t('auth.confirmEmail.successFallback')
    
    // Refresh user data to get the new email
    try {
      await userStore.fetchUser()
    } catch (e) {
      // Ignore error if user not logged in
    }
  } catch (error: any) {
    success.value = false
    errorMessage.value = error?.response?.data?.error || t('auth.confirmEmail.invalidLink')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.confirm-email-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 8rem);
  padding: 2rem 1rem;
}

.confirm-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  padding: 3rem 2rem;
  max-width: 32rem;
  width: 100%;
  text-align: center;
}

.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.status-content h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.status-content p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.status-content.success h2 {
  color: #059669;
}

.status-content.error h2 {
  color: #dc2626;
}

.mt-3 {
  margin-top: 1.5rem;
}
</style>
