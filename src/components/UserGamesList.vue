<template>
  <div class="user-games-list">
    <h2>Your Games</h2>
    <div v-if="games.length === 0" class="empty">
      <Message severity="info">No games found.</Message>
    </div>
    <div v-else class="games-scroll">
      <DataView :value="games" layout="grid">
        <template #grid="slotProps">
          <div class="game-item">
            <Card>
              <template #content>
                <img :src="slotProps.items.image" :alt="slotProps.items.name" class="game-image" />
                <div class="game-name">{{ slotProps.items.name }}</div>
              </template>
            </Card>
          </div>
        </template>
      </DataView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import Card from 'primevue/card';
import DataView from 'primevue/dataview';
import Message from 'primevue/message';

interface Game {
  id: number | string
  name: string
  image: string
}

defineProps<{ games: Game[] }>()
</script>

<style scoped>
.user-games-list {
  margin-top: 2rem;
}
.games-scroll {
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
}
.game-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  min-width: 180px;
  max-width: 220px;
}
.game-image {
  width: 100%;
  max-width: 180px;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}
.game-name {
  font-weight: 600;
  text-align: center;
}
</style>
