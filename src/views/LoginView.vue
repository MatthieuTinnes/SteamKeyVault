<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">email</label>
        <input id="email" v-model="email" type="text" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <button type="submit">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../api/users'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  try {
    const response = await loginUser(email.value, password.value)
    localStorage.setItem('token', response.data.token)
    router.push('/')
  } catch (err) {
    error.value = 'Invalid credentials or server error.'
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.75rem;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
button:hover {
  background: #369870;
}
.error {
  color: #e74c3c;
  margin-top: 1rem;
}
</style>
