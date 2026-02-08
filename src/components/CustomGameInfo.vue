<template>
  <div class="custom-game-info">
    <div class="content">
      <div class="header-section">
        <div class="image-container">
          <img :src="placeholderCustom" :alt="t('games.customGame')" class="header-image" />
        </div>

        <div class="info-container">
          <div class="title-row">
            <h2 class="title">{{ gameName }}</h2>
            <div class="actions">
              <Button 
                :label="steamRemoved ? t('games.removedFromSteam') : t('games.matchSteam')" 
                :icon="steamRemoved ? 'pi pi-exclamation-triangle' : 'pi pi-sync'" 
                class="p-button-sm p-button-outlined"
                :class="{ 'p-disabled': steamRemoved }"
                :disabled="steamRemoved"
                @click="openConvert" 
              />
              <Button icon="pi pi-trash" severity="danger" text rounded :aria-label="t('common.delete')"
                @click="openDeleteHandler" v-tooltip.bottom="t('games.deleteGameTooltip')" />
            </div>
          </div>
          <div class="publisher">{{ t('games.customPublisher') }}</div>
          <div v-if="steamRemoved" class="steam-removed-message">
            <i class="pi pi-info-circle"></i>
            <span>{{ t('games.steamRemovedMessage') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ConvertGameModal 
    v-model="convertVisible" 
    :userGameId="userGameId" 
    @converted="onConverted" 
  />

  <DeleteGameModal :modelValue="showDeleteModal" :hasKeys="hasKeys" @update:modelValue="localOnModalUpdate"
    @confirmed="confirmDeleteHandler" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import DeleteGameModal from './DeleteGameModal.vue'
import ConvertGameModal from './ConvertGameModal.vue'
import { useDeleteGame } from '@/composables/useDeleteGame'
import placeholderCustom from '@/assets/placeholder_custom-game.svg'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ 
  gameName: string; 
  userGameId: number;
  steamRemoved?: boolean;
}>()
const emit = defineEmits<{
  (e: 'converted'): void
  (e: 'deleted'): void
}>()

const convertVisible = ref(false)
const { showDeleteModal, hasKeys, openDelete, confirmDelete, onModalUpdate } = useDeleteGame()
const { t } = useI18n()

function openConvert() {
  convertVisible.value = true
}

function onConverted() {
  emit('converted')
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

.steam-removed-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.5rem;
  color: #ef4444;
  font-size: 0.9rem;
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
