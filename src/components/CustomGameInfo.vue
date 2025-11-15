<template>
  <div class="custom-game-info">
    <div style="display:flex;flex-direction:column;gap:0.75rem;width:100%">
      <h2 class="title">{{ gameName }}</h2>
      <div style="display:flex;gap:0.5rem;justify-content:flex-end">
        <Button label="Convert to Steam" icon="pi pi-external-link" class="p-button-sm" @click="openConvert" />
      </div>
    </div>
  </div>

  <Dialog v-model:visible="convertVisible" header="Convert to Steam game" :style="{ width: '520px' }">
    <div class="p-fluid">
      <AutoComplete
        v-model="searchQuery"
        :suggestions="results"
        @complete="onComplete"
        optionLabel="name"
        type="text"
        placeholder="Search for a Steam game..."
        class="search-bar"
        :loading="loading"
        @item-select="(e) => selected = e.value"
      />
      <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem">
        <Button label="Apply" class="p-button-primary" :disabled="!selected" @click="applySelection" />
        <Button label="Cancel" class="p-button-text" @click="closeConvert" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import AutoComplete from 'primevue/autocomplete'
import { searchSteamGames, updateUserGame } from '@/api/games'

const props = defineProps<{ gameName: string; userGameId: number }>()
const emit = defineEmits<{
  (e: 'converted'): void
}>()

const convertVisible = ref(false)
const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const selected = ref<any | null>(null)

function openConvert() {
  convertVisible.value = true
  searchQuery.value = ''
  results.value = []
  selected.value = null
}

function closeConvert() {
  convertVisible.value = false
}

async function onComplete(event: { query: string }) {
  const q = event.query.trim()
  if (!q) {
    results.value = []
    return
  }
  loading.value = true
  try {
    results.value = await searchSteamGames(q)
  } catch (e) {
    results.value = []
  } finally {
    loading.value = false
  }
}

async function applySelection() {
  if (!selected.value) return
  try {
    const payload = { steamapp_id: selected.value.appid, name: selected.value.name }
    await updateUserGame(props.userGameId, payload)
    emit('converted')
    closeConvert()
  } catch (e) {
    console.error('Failed to convert user game', e)
  }
}
</script>

<style scoped>
.custom-game-info {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 1.5rem;
  background: #1b2838;
  color: white;
  border-radius: 8px;
  margin-bottom: 1em;
}
.custom-game-info .title {
  margin: 0;
  font-size: 1.8rem;
}
.search-bar { width: 100%; margin-bottom: 1rem }
</style>
