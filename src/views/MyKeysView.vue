<template>
  <div class="my-keys-container">
    <h1>My Steam Keys</h1>
    <p>Welcome, {{ user?.username }}! Here you will soon be able to manage your Steam keys.</p>
    <AddGameModal @close="showAddGameModal = false" />
    <UserGamesList :games="games" />
    <!-- TODO: List and manage keys here -->
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import UserGamesList from '../components/UserGamesList.vue'
import AddGameModal from '../components/AddGameModal.vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const router = useRouter()
const showAddGameModal = ref(false)

// Dummy data for demonstration; replace with real API call later
const games = ref([
  { id: 1, name: 'Half-Life 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg' },
  { id: 2, name: 'Portal 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg' },
  { id: 3, name: 'The Witcher 3', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg' },
    { id: 1, name: 'Half-Life 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg' },
  { id: 2, name: 'Portal 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg' },
  { id: 3, name: 'The Witcher 3', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg' },  { id: 1, name: 'Half-Life 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg' },
  { id: 2, name: 'Portal 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg' },
  { id: 3, name: 'The Witcher 3', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg' },  { id: 1, name: 'Half-Life 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg' },
  { id: 2, name: 'Portal 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg' },
  { id: 3, name: 'The Witcher 3', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg' },  { id: 1, name: 'Half-Life 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg' },
  { id: 2, name: 'Portal 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg' },
  { id: 3, name: 'The Witcher 3', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg' },
  { id: 4, name: 'Cyberpunk 2077', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/109150/header.jpg' },
  { id: 5, name: 'Doom Eternal', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg' },
  { id: 6, name: 'Stardew Valley', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg' }
])
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

.add-game-btn {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-game-btn:hover {
  background-color: #0056b3;
}
</style>
