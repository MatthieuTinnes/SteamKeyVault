<template>
  <div class="user-games-list">
    <h2>Your Games</h2>
    <div v-if="games.length === 0" class="empty">No games found.</div>
    <div v-else class="games-scroll">
      <ul>
        <li v-for="game in games" :key="game.id" class="game-item">
          <img :src="game.image" :alt="game.name" class="game-image" />
          <span class="game-name">{{ game.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

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
}
.game-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
  background: #eee;
}
.game-name {
  font-size: 1.1rem;
  color: var(--skv-primary);
}
.empty {
  color: var(--skv-secondary);
  font-style: italic;
}
</style>
