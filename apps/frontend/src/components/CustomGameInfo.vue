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

          <div class="platform-row">
            <template v-if="!editingPlatform">
              <span class="platform-label">{{ t('games.platformLabel') }}:</span>
              <span v-if="platform" class="platform-tag">
                <i class="pi pi-tag"></i>
                <span>{{ platform }}</span>
              </span>
              <span v-else class="platform-empty">{{ t('games.platformNotSet') }}</span>
              <Button
                :icon="platform ? 'pi pi-pencil' : 'pi pi-plus'"
                :aria-label="platform ? t('games.platformEdit') : t('games.platformAdd')"
                v-tooltip.bottom="platform ? t('games.platformEdit') : t('games.platformAdd')"
                class="p-button-sm p-button-text p-button-rounded"
                @click="startEditPlatform"
              />
            </template>
            <template v-else>
              <AutoComplete
                v-model="platformDraft"
                :suggestions="platformSuggestions"
                @complete="onPlatformComplete"
                :placeholder="t('games.platformPlaceholder')"
                class="platform-input"
                inputClass="platform-input-inner"
                :maxlength="100"
                dropdown
              />
              <Button
                icon="pi pi-check"
                :aria-label="t('common.save') || 'Save'"
                v-tooltip.bottom="t('common.save') || 'Save'"
                class="p-button-sm p-button-success p-button-rounded"
                :loading="savingPlatform"
                @click="savePlatform"
              />
              <Button
                icon="pi pi-times"
                :aria-label="t('common.cancel')"
                v-tooltip.bottom="t('common.cancel')"
                class="p-button-sm p-button-text p-button-rounded"
                :disabled="savingPlatform"
                @click="cancelEditPlatform"
              />
            </template>
          </div>
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
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import AutoComplete from 'primevue/autocomplete'
import DeleteGameModal from './DeleteGameModal.vue'
import ConvertGameModal from './ConvertGameModal.vue'
import { useDeleteGame } from '@/composables/useDeleteGame'
import placeholderCustom from '@/assets/placeholder_custom-game.svg'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { updateUserGame } from '@/api/games'
import { CUSTOM_GAME_PLATFORMS } from '@/utils/customGamePlatforms'

const props = defineProps<{ 
  gameName: string; 
  userGameId: number;
  steamRemoved?: boolean;
  platform?: string | null;
}>()
const emit = defineEmits<{
  (e: 'converted'): void
  (e: 'deleted'): void
  (e: 'platformUpdated', platform: string): void
}>()

const convertVisible = ref(false)
const { showDeleteModal, hasKeys, openDelete, confirmDelete, onModalUpdate } = useDeleteGame()
const { t } = useI18n()
const toast = useToast()

const platform = ref<string>(props.platform ?? '')
const editingPlatform = ref(false)
const platformDraft = ref<string>('')
const platformSuggestions = ref<string[]>([])
const savingPlatform = ref(false)

watch(
  () => [props.userGameId, props.platform],
  () => {
    platform.value = props.platform ?? ''
    editingPlatform.value = false
    platformDraft.value = ''
  }
)

function startEditPlatform() {
  platformDraft.value = platform.value
  platformSuggestions.value = [...CUSTOM_GAME_PLATFORMS]
  editingPlatform.value = true
}

function cancelEditPlatform() {
  editingPlatform.value = false
  platformDraft.value = ''
}

function onPlatformComplete(event: { query: string }) {
  const q = (event.query || '').trim().toLowerCase()
  if (!q) {
    platformSuggestions.value = [...CUSTOM_GAME_PLATFORMS]
    return
  }
  platformSuggestions.value = CUSTOM_GAME_PLATFORMS.filter((p) => p.toLowerCase().includes(q))
}

async function savePlatform() {
  const value = (typeof platformDraft.value === 'string' ? platformDraft.value : '').trim().slice(0, 100)
  if (value === platform.value) {
    editingPlatform.value = false
    return
  }
  savingPlatform.value = true
  try {
    await updateUserGame(props.userGameId, { platform: value })
    platform.value = value
    editingPlatform.value = false
    emit('platformUpdated', value)
    toast.add({
      severity: 'success',
      summary: t('games.platformSavedSummary'),
      detail: t('games.platformSavedDetail'),
      life: 2500,
    })
  } catch (err) {
    console.error('Failed to update platform:', err)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('games.platformSaveFailed'),
      life: 3000,
    })
  } finally {
    savingPlatform.value = false
  }
}

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

.platform-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.platform-label {
  font-weight: 600;
}

.platform-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 0.15rem 0.65rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.platform-empty {
  font-style: italic;
  opacity: 0.8;
}

.platform-input {
  min-width: 14rem;
}

.platform-input :deep(.platform-input-inner) {
  width: 100%;
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
