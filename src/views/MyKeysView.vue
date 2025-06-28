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
        <KeysTable :keys="keys" />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { computed, ref, onMounted } from 'vue'
import UserGamesList from '../components/UserGamesList.vue'
import KeysTable from '../components/KeysTable.vue'
import AddGameModal from '../components/AddGameModal.vue'
import Card from 'primevue/card';
import { getUserGames } from '../api/games'
import type { Game } from '@/models/Game';

const userStore = useUserStore()
const user = computed(() => userStore.user)
const showAddGameModal = ref(false)
const games = ref([])

onMounted(async () => {
  const apiGames = await getUserGames()
  games.value = apiGames.map((g: Game) => ({
    id: g.id,
    name: g.name,
    steamappid: g.steamappid,
  }))
})

const keys = ref([
  { key: 'ABC123', used: false, date_added: '2023-10-01' },
  { key: 'XYZ456', used: true, date_added: '2023-09-15', date_used: '2023-10-02', current_use: 'User1' },
  { key: 'LMN789', used: false, date_added: '2023-08-20' },
])
</script>

<style scoped>
</style>
