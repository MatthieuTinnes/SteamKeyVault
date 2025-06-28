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
import { defineProps, ref } from 'vue'
import Message from 'primevue/message';
import Listbox from 'primevue/listbox';
import type { Game } from '../models/Game';

defineProps<{ games: Game[] }>()
const selectedGame = ref<Game | null>(null)

</script>

<style scoped>
</style>
