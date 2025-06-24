<template>
  <div class="my-keys-container">
    <Card class="my-keys-card">
      <template #title>My Steam Keys</template>
      <template #content>
        <p>Welcome, {{ user?.username }}! Here you will soon be able to manage your Steam keys.</p>
        <div class="my-keys-actions">
          <AddGameModal @close="showAddGameModal = false" />
        </div>
        <UserGamesList :games="games" />
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import UserGamesList from '../components/UserGamesList.vue'
import AddGameModal from '../components/AddGameModal.vue'
import Card from 'primevue/card';

const userStore = useUserStore()
const user = computed(() => userStore.user)
const router = useRouter()
const showAddGameModal = ref(false)

// Dummy data for demonstration; replace with real API call later
const games = ref([
  { id: 1, name: 'Half-Life 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg' },
  { id: 2, name: 'Portal 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg' },
  { id: 3, name: 'The Witcher 3', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg' },
  { id: 4, name: 'Cyberpunk 2077', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/109150/header.jpg' },
  { id: 5, name: 'Doom Eternal', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg' },
  { id: 6, name: 'Stardew Valley', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg' }
])
</script>

<style scoped>
.my-keys-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 60vh;
}
.my-keys-card {
  width: 100%;
  max-width: 700px;
}
.my-keys-actions {
  margin-bottom: 1.5rem;
}
</style>
