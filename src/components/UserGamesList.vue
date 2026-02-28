<template>
  <div class="user-games-list">
    <div class="filter-container">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="filter" :placeholder="t('games.filterPlaceholder')" />
      </IconField>
    </div>

    <div class="list-container">
      <div
        v-for="game in filteredGames"
        :key="game.user_game_id"
        class="game-item"
        :class="{ active: selectedGame?.user_game_id === game.user_game_id }"
        @click="selectGame(game)"
      >
        <span class="game-name">{{ game.name }}</span>
      </div>
      <div v-if="filteredGames.length === 0" class="empty-message">
        {{ t('games.noGamesFound') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import InputText from 'primevue/inputtext'
import type { Game } from '../models/Game'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ games: Game[] }>()
const emit = defineEmits(['gameSelected'])
const selectedGame = ref<Game | null>(null)
const filter = ref('')
const { t } = useI18n()

const filteredGames = computed(() => {
  if (!filter.value) return props.games
  return props.games.filter(g => g.name.toLowerCase().includes(filter.value.toLowerCase()))
})

watch(filteredGames, (newList) => {
  if (newList.length === 1) {
    selectedGame.value = newList[0]
    emit('gameSelected', newList[0])
  }
})

function selectGame(game: Game) {
  selectedGame.value = game
  emit('gameSelected', game)
}
</script>

<style scoped>
.user-games-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-container {
  margin-bottom: 0.75rem;
}

.list-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.game-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
  min-width: 0;
}

.game-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.game-item.active {
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  color: var(--primary-color);
  font-weight: 600;
}

.game-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-message {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.875rem;
}
</style>