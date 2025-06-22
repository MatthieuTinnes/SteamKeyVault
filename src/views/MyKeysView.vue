<template>
  <div class="my-keys-container">
    <h1>My Steam Keys</h1>
    <p>Welcome, {{ user?.username }}! Here you will soon be able to manage your Steam keys.</p>
    <!-- TODO: List and manage keys here -->
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const router = useRouter()

onMounted(async () => {
  if (!user.value || !user.value.username) {
    await userStore.fetchUser()
    if (!user.value || !user.value.username) {
      router.replace('/login')
    }
  }
})
</script>

<style scoped>
.my-keys-container {
  max-width: 700px;
  margin: 60px auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
  background: #fff;
  text-align: center;
}
</style>
