<template>
  <div class="register-container">
    <h1>Register</h1>
    <form @submit.prevent="handleRegister">
      <div>
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <div>
        <label for="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" v-model="confirmPassword" type="password" required />
      </div>
      <button type="submit">Register</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../api/users'

const email = ref('')
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
    await registerUser(email.value, password.value)
    success.value = 'Registration successful! You can now log in.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    error.value = err?.response?.data?.detail || 'Registration failed.'
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
  background: #fff;
}
form > div {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--skv-gray);
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.75rem;
  background: var(--skv-primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
button:hover {
  background: var(--skv-accent);
}
.error {
  color: #e74c3c;
  margin-top: 1rem;
}
.success {
  color: var(--skv-primary);
  margin-top: 1rem;
}
</style>
