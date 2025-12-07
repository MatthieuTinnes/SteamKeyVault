<template>
  <div class="custom-game-info">
    <div class="content">
      <div class="header-section">
        <div class="image-container">
          <img :src="placeholderCustom" alt="Custom Game" class="header-image" />
        </div>
        
        <div class="info-container">
          <div class="title-row">
            <h2 class="title">{{ gameName }}</h2>
            <div class="actions">
              <Button 
                label="Convert to Steam" 
                icon="pi pi-sync" 
                class="p-button-sm p-button-outlined" 
                @click="openConvert" 
              />
              <Button 
                icon="pi pi-trash" 
                severity="danger" 
                text 
                rounded 
                aria-label="Delete game" 
                @click="openDeleteHandler"
                v-tooltip.bottom="'Delete game from library'"
              />
            </div>
          </div>
          <div class="publisher">Custom Game</div>
        </div>
      </div>
    </div>
  </div>

  <Dialog 
    v-model:visible="convertVisible" 
    header="Convert to Steam game" 
    :style="{ width: 'min(32rem, 95vw)' }"
    :modal="true"
    class="p-fluid"
  >
    <div class="dialog-content">
      <span class="p-input-icon-left w-full mb-4">
        <i class="pi pi-search" />
        <AutoComplete
          v-model="searchQuery"
          :suggestions="results"
          @complete="onComplete"
          optionLabel="name"
          placeholder="Search for a Steam game..."
          class="w-full"
          :loading="loading"
          @item-select="(e) => selected = e.value"
        />
      </span>
      
      <div class="dialog-footer">
        <Button label="Cancel" icon="pi pi-times" text @click="closeConvert" />
        <Button label="Apply" icon="pi pi-check" :disabled="!selected" @click="applySelection" />
      </div>
    </div>
  </Dialog>

  <DeleteGameModal 
    :modelValue="showDeleteModal" 
    :hasKeys="hasKeys" 
    @update:modelValue="localOnModalUpdate" 
    @confirmed="confirmDeleteHandler" 
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import AutoComplete from 'primevue/autocomplete'
import DeleteGameModal from './DeleteGameModal.vue'
import { searchSteamGames, updateUserGame } from '@/api/games'
import { useDeleteGame } from '@/composables/useDeleteGame'
import placeholderCustom from '@/assets/placeholder_custom-game.svg'

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
  position: relative;
  background-color: var(--bg-secondary);
  border-radius: 0.5rem;
  overflow: hidden;
  min-height: 14rem;
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
}

.content {
  padding: 1.5rem;
}

.header-section {
  display: flex;
  gap: 1.5rem;
}

.image-container {
  flex-shrink: 0;
  width: 292px;
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-image {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0.8;
}

.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.publisher {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-style: italic;
}

.dialog-content {
  padding-top: 0.5rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.w-full {
  width: 100%;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
  }
  
  .image-container {
    width: 100%;
    max-width: 400px;
  }
  
  .title-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
