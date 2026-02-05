<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title><h2 class="login-title">Login</h2></template>
      <template #content>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <InputText id="email" v-model="email" type="text" required class="w-full" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <Password :feedback="false" id="password" v-model="password" toggleMask required class="w-full" inputClass="w-full" />
          </div>
          <Button type="submit" label="Login" class="w-full mt-4" />
        </form>
        <div class="register-link mt-4">
          <span>Don't have an account?</span>
          <Button label="Register" link size="small" @click="goToRegister" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../api/auth'
import { useUserStore } from '../stores/user'
import { useCryptoStore } from '@/stores/crypto'
import { deriveKeyFromPassword, unwrapMasterKey } from '@/utils/crypto'
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  const loginData = await loginUser(email.value, password.value)
  const userKey = await deriveKeyFromPassword(password.value, loginData.mk_salt, {
    iterations: loginData.kdf_iterations,
    hash: loginData.kdf_hash
  })
  const masterKeyBytes = await unwrapMasterKey(loginData.wrapped_mk_password, userKey)
  const cryptoStore = useCryptoStore()
  cryptoStore.setMasterKeyBytes(masterKeyBytes)
  cryptoStore.setKdfContext(loginData.mk_salt, {
    iterations: loginData.kdf_iterations,
    hash: loginData.kdf_hash
  })
  await useUserStore().fetchUser()
  router.push('/my-keys')
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 5rem);
  background: var(--bg-secondary);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 25rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-weight: 700;
}

.login-form {
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

.register-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
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
