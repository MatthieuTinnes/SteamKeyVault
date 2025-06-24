<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>Login</template>
      <template #content>
        <form @submit.prevent="handleLogin">
          <div class="p-field">
            <label for="email">Email</label>
            <InputText id="email" v-model="email" type="text" required class="p-inputtext-sm" />
          </div>
          <div class="p-field">
            <label for="password">Password</label>
            <Password id="password" v-model="password" toggleMask required class="p-inputtext-sm" />
          </div>
          <Button type="submit" label="Login" class="p-mt-2 p-button-primary p-button-sm" />
          <Message v-if="error" severity="error" class="p-mt-2">{{ error }}</Message>
        </form>
        <div class="register-link p-mt-3">
          <span>Don't have an account?</span>
          <Button label="Register" class="p-button-link p-button-sm" @click="goToRegister" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../api/auth'
import { useUserStore } from '@/stores/user'
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  try {
    await loginUser(email.value, password.value)
    await useUserStore().fetchUser()
    router.push('/my-keys')
  } catch (err) {
    error.value = 'Invalid credentials or server error.'
  }
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
  min-height: 60vh;
}
.login-card {
  width: 350px;
}
.p-field {
  margin-bottom: 1.5rem;
}
.register-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
