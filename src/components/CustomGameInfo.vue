<template>
  <div class="custom-game-info">
    <div style="display:flex;flex-direction:column;gap:0.75rem;width:100%">
      <h2 class="title">{{ gameName }}</h2>
      <div style="display:flex;gap:0.5rem;justify-content:flex-end">
        <Button label="Convert to Steam" icon="pi pi-external-link" class="p-button-sm" @click="openConvert" />
        <Button class="p-button-sm p-button-danger" @click="openDeleteHandler"><i
        class="pi pi-trash"></i></Button>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="convertVisible" header="Convert to Steam game" :style="{ width: 'min(32rem, 95vw)' }">
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
  <DeleteGameModal :modelValue="showDeleteModal" :hasKeys="hasKeys" @update:modelValue="localOnModalUpdate" @confirmed="confirmDeleteHandler" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import AutoComplete from 'primevue/autocomplete'
import DeleteGameModal from './DeleteGameModal.vue'
import { searchSteamGames, updateUserGame } from '@/api/games'
import { useDeleteGame } from '@/composables/useDeleteGame'

const props = defineProps<{ gameName: string; userGameId: number }>()
const emit = defineEmits<{
  (e: 'converted'): void
  (e: 'deleted'): void
}>()

const convertVisible = ref(false)
const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const selected = ref<any | null>(null)
const { showDeleteModal, hasKeys, openDelete, confirmDelete, onModalUpdate } = useDeleteGame()

function openConvert() {
  convertVisible.value = true
  searchQuery.value = ''
  results.value = []
  selected.value = null
}

function openDeleteHandler() {
  void openDelete(props.userGameId ?? null)
}

async function confirmDeleteHandler() {
  const success = await confirmDelete(props.userGameId ?? null)
  if (success) emit('deleted')
}

function localOnModalUpdate(v: boolean) {
  showDeleteModal.value = v
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
  min-height: 7.5rem;
  padding: 1.5rem;
  background: #1b2838;
  color: white;
  border-radius: 0.5rem;
  margin-bottom: 2em;
}
.custom-game-info .title {
  margin: 0;
  font-size: 1.8rem;
}
</style>
