<template>
  <div class="user-games-list">
    <div class="filter-container">
      <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filter" placeholder="Filter games..."  />
      </IconField>
    </div>

    <div class="list-container">
      <Listbox 
        v-model="selectedGame" 
        :options="filteredGames" 
        optionLabel="name" 
        class="w-full game-listbox"
        listStyle="max-height: 100%"
      >
        <template #option="slotProps">
          <div class="game-item">
            <span class="game-name">{{ slotProps.option.name }}</span>
          </div>
        </template>
        <template #empty>
          <div class="empty-message">No games found.</div>
        </template>
      </Listbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, defineEmits, computed } from 'vue'
import Listbox from 'primevue/listbox';
import InputText from 'primevue/inputtext';
import type { Game } from '../models/Game';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

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
.user-games-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-container {
  margin-bottom: 1rem;
}

.w-full {
  width: 100%;
}

.list-container {
  flex: 1;
  overflow-y: auto;
  /* Ensure it takes available space but scrolls */
  min-height: 0; 
}

/* Customizing Listbox to match design system */
:deep(.p-listbox) {
  border: none;
  background: transparent;
  padding: 0;
}

:deep(.p-listbox-list) {
  padding: 0;
}

:deep(.p-listbox-item) {
  margin-bottom: 0.25rem;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  transition: background-color 0.2s, color 0.2s;
  color: var(--text-secondary);
}

:deep(.p-listbox-item:not(.p-highlight):not(.p-disabled):hover) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

:deep(.p-listbox-item.p-highlight) {
  background: var(--primary-color);
  color: #ffffff;
}

.game-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.game-icon {
  font-size: 1rem;
  opacity: 0.7;
}

.game-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-message {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}
</style>