<template>
  <div class="my-keys-container">
    <Card class="my-keys-card">
      <template #title>My Steam Keys</template>
      <template #content>
        <p>Welcome, {{ user?.username }}! </p>
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
import { computed, ref, onMounted } from 'vue'
import UserGamesList from '../components/UserGamesList.vue'
import AddGameModal from '../components/AddGameModal.vue'
import Card from 'primevue/card';
import { getUserGames } from '../api/games'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const router = useRouter()
const showAddGameModal = ref(false)
const games = ref([])

onMounted(async () => {
  const apiGames = await getUserGames()
  games.value = apiGames.map((g) => ({
    id: g.id,
    name: g.name,
    steamappid: g.steamappid,
  }))
})
</script>

<style scoped>

</style>
