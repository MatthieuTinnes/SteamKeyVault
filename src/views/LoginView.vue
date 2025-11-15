<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title><h2>Login</h2></template>
      <template #content>
        <form @submit.prevent="handleLogin">
          <div class="p-field">
            <label for="email">Email</label>
            <InputText id="email" v-model="email" type="text" required class="p-inputtext-sm" />
          </div>
          <div class="p-field">
            <label for="password">Password</label>
            <Password :feedback="false" id="password" v-model="password" toggleMask required class="p-inputtext-sm" />
          </div>
          <Button type="submit" label="Login" class="p-mt-2 p-button-primary p-button-sm" />
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

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
    await loginUser(email.value, password.value)
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
  min-height: 60vh;
}
.login-card {
  width: min(90vw, 25rem);
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 1.25rem;
  box-shadow: 0 0.125rem 1rem rgba(41, 106, 162, 0.08);
  border: 0.0625rem solid #e5e7eb;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.p-field label {
  font-weight: 600;
  color: #15406b;
  margin-bottom: 0.5rem;
  display: block;
}
.p-inputtext-sm,
.p-password-input,
.p-password {
  width: 100%;
  box-sizing: border-box;
  border-radius: 0.5rem;
  border: 0.0625rem solid #bcd6ee;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: #f8fafc;
  color: #222;
  transition: border 0.2s;
}
.p-inputtext-sm:focus, .p-password-input:focus {
  border-color: #296aa2;
  outline: none;
}
.p-button-primary {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  border-radius: 0.5rem;
  padding: 0.75rem 0;
}
.register-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
.p-message {
  border-radius: 0.5rem;
  font-size: 1rem;
  margin-top: 0.5rem;
}
</style>
