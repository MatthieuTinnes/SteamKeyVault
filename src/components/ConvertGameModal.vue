<template>
  <Dialog 
    :visible="modelValue" 
    @update:visible="updateVisible"
    :header="t('games.convertHeader')" 
    :style="{ width: 'min(32rem, 95vw)' }"
    :modal="true"
    class="convert-game-modal"
  >
    <div class="dialog-content">
      <p class="description">{{ t('games.convertDesc') }}</p>
      
      <div class="field">
        <span class="w-full">
          <AutoComplete 
            v-model="searchQuery" 
            :suggestions="results" 
            @complete="onComplete" 
            optionLabel="name"
            :placeholder="t('games.searchSteamPlaceholder')" 
            class="w-full" 
            :loading="loading"
            @item-select="(e) => selected = e.value"
            inputClass="w-full"
          >
            <template #option="slotProps">
              <div class="game-option">
                <img :src="`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${slotProps.option.appid}/header.jpg`" :alt="slotProps.option.name" class="option-image" />
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </AutoComplete>
        </span>
      </div>

      <div v-if="selected" class="selected-preview">
        <div class="preview-label">{{ t('games.selectedGame') }}</div>
        <div class="preview-card">
          <img :src="`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${selected.appid}/header.jpg`" :alt="selected.name" class="preview-image" />
          <div class="preview-details">
            <div class="preview-name">{{ selected.name }}</div>
            <div class="preview-id">{{ t('games.appId', { id: selected.appid }) }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button :label="t('common.cancel')" icon="pi pi-times" text @click="closeModal" />
      <Button :label="t('games.convertAction')" icon="pi pi-sync" :disabled="!selected" @click="applySelection" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import AutoComplete from 'primevue/autocomplete'
import { searchSteamGames, updateUserGame } from '@/api/games'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ 
  modelValue: boolean;
  userGameId: number;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'converted'): void
}>()

const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const selected = ref<any | null>(null)
const { t } = useI18n()

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    results.value = []
    selected.value = null
  }
})

function updateVisible(value: boolean) {
  emit('update:modelValue', value)
}

function closeModal() {
  emit('update:modelValue', false)
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
    closeModal()
  } catch (e) {
    console.error('Failed to convert user game', e)
  }
}
</script>

<style scoped>
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.description {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.field {
  display: flex;
  flex-direction: column;
}

.w-full {
  width: 100%;
}

.game-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-image {
  width: 60px;
  height: auto;
  border-radius: 0.25rem;
}

.selected-preview {
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.preview-card {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.preview-image {
  width: 120px;
  height: auto;
  border-radius: 0.25rem;
  box-shadow: var(--shadow-sm);
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.preview-id {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-family: monospace;
}

/* PrimeVue overrides */
:deep(.p-autocomplete) {
  width: 100%;
}
:deep(.p-autocomplete-input) {
  width: 100%;
}
</style>