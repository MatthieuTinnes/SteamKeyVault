<template>
  <div class="my-keys-container">
    <Card class="my-keys-card">
      <template #title>My Steam Keys</template>
      <template #content>
        <p>Welcome, {{ user?.username }}! </p>
        <div class="my-keys-actions">
          <AddGameModal @close="showAddGameModal = false" />
        </div>
        <UserGamesList :games="games" @gameSelected="handleGameSelected" />
        <KeysTable :keys="keys" :gameId="selectedGameId" @refresh="refreshKeys" />
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
import { getKeysForGame } from '../api/keys'
import type { Game } from '@/models/Game';

const userStore = useUserStore()
const user = computed(() => userStore.user)
const showAddGameModal = ref(false)
const games = ref([])
const keys = ref([])
const selectedGameId = ref<number | null>(null)

onMounted(async () => {
  const apiGames = await getUserGames()
  games.value = apiGames.map((g: Game) => ({
    id: g.id,
    name: g.name,
    steamappid: g.steamappid,
  }))
})

function handleGameSelected(game: Game) {
  selectedGameId.value = game.id
  refreshKeys()
}

async function refreshKeys() {
  if (!selectedGameId.value) {
    keys.value = []
    return
  }
  const apiKeys = await getKeysForGame(selectedGameId.value)
  keys.value = apiKeys
}
</script>

<style scoped>
</style>
