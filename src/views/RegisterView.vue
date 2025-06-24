<template>
  <div class="register-container">
    <Card class="register-card">
      <template #title>Register</template>
      <template #content>
        <form @submit.prevent="handleRegister">
          <div class="p-field">
            <label for="email">Email</label>
            <InputText id="email" v-model="email" type="email" required class="p-inputtext-sm" />
          </div>
          <div class="p-field">
            <label for="username">Username</label>
            <InputText id="username" v-model="username" type="text" required class="p-inputtext-sm" />
          </div>
          <div class="p-field">
            <label for="password">Password</label>
            <Password id="password" v-model="password" toggleMask required class="p-inputtext-sm" />
          </div>
          <div class="p-field">
            <label for="confirmPassword">Confirm Password</label>
            <Password id="confirmPassword" v-model="confirmPassword" toggleMask required class="p-inputtext-sm" />
          </div>
          <Button type="submit" label="Register" class="p-mt-2 p-button-primary p-button-sm" />
          <Message v-if="error" severity="error" class="p-mt-2">{{ error }}</Message>
          <Message v-if="success" severity="success" class="p-mt-2">{{ success }}</Message>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../api/auth'
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const router = useRouter()

const handleRegister = async () => {
  error.value = ''
  success.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  try {
    await registerUser(email.value, username.value, password.value)
    success.value = 'Registration successful! You can now log in.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    error.value = err?.response?.data?.error || 'Registration failed.'
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
.register-card {
  width: 400px;
}
.p-field {
  margin-bottom: 1.5rem;
}
</style>
