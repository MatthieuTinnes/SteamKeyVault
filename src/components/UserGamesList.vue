<template>
  <div class="user-games-list">
    <h2>Your Games</h2>
    <div v-if="games.length === 0" class="empty">
      <Message severity="info">No games found.</Message>
    </div>
    <Listbox v-model="selectedGame" :options="games" optionLabel="name" class="w-full md:w-56" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, defineEmits } from 'vue'
import Message from 'primevue/message';
import Listbox from 'primevue/listbox';
import type { Game } from '../models/Game';

defineProps<{ games: Game[] }>()
const emit = defineEmits(['gameSelected'])
const selectedGame = ref<Game | null>(null)

watch(selectedGame, (game) => {
  if (game) emit('gameSelected', game)
})
</script>

<style scoped>
</style>
