<template>
  <div class="user-games-list">
    <h2>Your Games</h2>

    <div class="filter-row">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <InputText v-model="filter" type="text" class="p-inputtext-sm filter-input" placeholder="Filter games..." />
      </span>
    </div>

    <div class="listbox-wrapper">
      <Listbox v-model="selectedGame" :options="filteredGames" emptyMessage="No games found" optionLabel="name" class="user-listbox" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, defineEmits, computed } from 'vue'
import Listbox from 'primevue/listbox';
import InputText from 'primevue/inputtext';
import type { Game } from '../models/Game';

const props = defineProps<{ games: Game[] }>()
const emit = defineEmits(['gameSelected'])
const selectedGame = ref<Game | null>(null)
const filter = ref('')

const filteredGames = computed(() => {
  if (!filter.value) return props.games
  return props.games.filter(g => g.name.toLowerCase().includes(filter.value.toLowerCase()))
})

watch(filteredGames, (newList) => {
  if (newList.length === 1) {
    selectedGame.value = newList[0]
  }
})
watch(selectedGame, (game) => {
  if (game) emit('gameSelected', game)
})
</script>

<style scoped>
.filter-row {
  margin-bottom: 1rem;
  position: relative;
}
.p-input-icon-left {
  display: flex;
  align-items: center;
  position: relative;
}
.filter-input {
  width: 100%;
  padding-left: 2rem;
  padding-right: 2rem;
}
.pi-search {
  position: absolute;
  left: 0.75rem;
  color: var(--text-tertiary);
}
.filter-clear {
  position: absolute;
  right: 0.75rem;
  color: #888;
  cursor: pointer;
}

.listbox-wrapper {
  /* make the left column scroll internally when content overflows */
  max-height: calc(100vh - 20rem);
  overflow: auto;
}

.user-listbox {
  width: 100%;
  box-sizing: border-box;
}
</style>
