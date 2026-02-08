<template>
  <div class="keys-table">
    <!-- Toolbar for Add Key -->
    <div class="toolbar">
      <Button :label="t('keys.addKey')" icon="pi pi-plus" @click="showAddKeyDialog = true" :disabled="!gameId" :tooltip="!gameId ? t('keys.selectGameFirst') : undefined" />
    </div>
    <div ref="tableContainer" class="datatable-wrapper">
      <DataTable
        :value="keys"
        paginator
        :rows="rowsPerPage"
        striped-rows
        responsiveLayout="scroll"
        class="p-datatable-sm"
      >
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-key empty-icon"></i>
          <p>{{ t('keys.emptyTitle') }}</p>
        </div>
      </template>
      <Column field="key" :header="t('keys.columnKey')">
        <template #body="{ data }">
          <span class="key-text">{{ data.key }}</span>
        </template>
      </Column>
      <Column sortable field="date_added" :header="t('keys.columnDateAdded')">
        <template #body="{ data }">
          {{ formatDate(data.date_added) }}
        </template>
      </Column>
      <Column sortable field="current_use" :header="t('keys.columnUsage')">
        <template #body="{ data }">
          <span class="usage-badge" :class="getUsageClass(data.current_use)">
            {{ getCurrentUseLabel(data.current_use) }}
          </span>
        </template>
      </Column>
      <Column sortable field="used" :header="t('keys.columnStatus')" style="width: 8rem; text-align: center">
        <template #body="{ data }">
          <div class="status-stack">
            <span v-if="data.share_in_progress" class="status-badge sharing">
              <i class="pi pi-share-alt"></i> {{ t('keys.statusSharing') }}
            </span>
            <span v-if="data.used" class="status-badge used">
              <i class="pi pi-check-circle"></i> {{ t('keys.statusUsed') }}
            </span>
            <span v-else class="status-badge available">
              <i class="pi pi-circle"></i> {{ t('keys.statusAvailable') }}
            </span>
          </div>
        </template>
      </Column>
      <Column :header="t('keys.columnActions')" style="width: 10rem; text-align: right">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button icon="pi pi-copy" class="p-button-text p-button p-button-secondary" @click="copyKey(data.key)" v-tooltip.top="t('keys.actionCopyKey')" />
            <Button
              icon="pi pi-share-alt"
              class="p-button-text p-button p-button-help"
              :disabled="data.used"
              @click="openShareDialog(data)"
              v-tooltip.top="data.used ? t('keys.actionKeyUsed') : t('keys.actionShare')"
            />
            <Button icon="pi pi-pencil" class="p-button-text p-button p-button-info" @click="openEditDialog(data)" v-tooltip.top="t('keys.actionEdit')" />
            <Button icon="pi pi-trash" class="p-button-text p-button p-button-danger" @click="openDeleteDialog(data)" v-tooltip.top="t('keys.actionDelete')" />
          </div>
        </template>
      </Column>
      </DataTable>
    </div>

    <!-- Add Key Dialog -->
    <Dialog v-model:visible="showAddKeyDialog" :header="t('keys.addDialogTitle')" :modal="true" :style="{ width: 'min(30rem, 90vw)' }" class="p-fluid">
      <div class="field">
        <label for="add_key">{{ t('keys.keyLabel') }}</label>
        <InputText id="add_key" v-model="newKey" :placeholder="t('keys.keyPlaceholder')" />
      </div>
      <div class="field">
        <label for="add_current_use">{{ t('keys.usageOptional') }}</label>
        <Dropdown id="add_current_use" v-model="newCurrentUse" :options="currentUseOptions" optionLabel="label" optionValue="value" :placeholder="t('keys.usagePlaceholder')" />
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" icon="pi pi-times" text @click="showAddKeyDialog = false" />
        <Button :label="t('keys.addKey')" icon="pi pi-check" :disabled="!newKey || !gameId" @click="handleAddKey" />
      </template>
    </Dialog>

    <!-- Edit Key Dialog -->
    <Dialog v-model:visible="showEditKeyDialog" :header="t('keys.editDialogTitle')" :modal="true" :style="{ width: 'min(30rem, 90vw)' }" class="p-fluid">
      <div class="field">
        <label for="edit_key">{{ t('keys.keyLabel') }}</label>
        <InputText id="edit_key" v-model="editKeyValue" />
      </div>
      <div class="field">
        <label for="edit_current_use">{{ t('keys.usageLabel') }}</label>
        <Dropdown id="edit_current_use" v-model="editCurrentUse" :options="currentUseOptions" optionLabel="label" optionValue="value" :placeholder="t('keys.usagePlaceholder')" />
      </div>
      <div class="field-checkbox">
        <Checkbox v-model="editUsed" :binary="true" inputId="edit_used" />
        <label for="edit_used">{{ t('keys.markUsed') }}</label>
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" icon="pi pi-times" text @click="showEditKeyDialog = false" />
        <Button :label="t('keys.saveChanges')" icon="pi pi-check" @click="saveEditKey" />
      </template>
    </Dialog>

    <!-- Delete Key Dialog -->
    <Dialog v-model:visible="showDeleteKeyDialog" :header="t('keys.deleteDialogTitle')" :modal="true" :style="{ width: 'min(25rem, 90vw)' }">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: #ef4444" />
        <span>{{ t('keys.deleteConfirm') }}</span>
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" icon="pi pi-times" text @click="showDeleteKeyDialog = false" />
        <Button :label="t('common.delete')" icon="pi pi-trash" severity="danger" @click="confirmDeleteKey" />
      </template>
    </Dialog>

    <!-- Share Key Dialog -->
    <Dialog v-model:visible="showShareDialog" :header="t('keys.shareDialogTitle')" :modal="true" :style="{ width: 'min(32rem, 92vw)' }" class="p-fluid">
      <div class="field">
        <label for="share_link">{{ t('keys.shareLink') }}</label>
        <InputText id="share_link" v-model="shareLink" readonly />
        <small v-if="shareExpiresAt" class="hint">{{ t('keys.expiresOn', { date: formatDateTime(shareExpiresAt) }) }}</small>
      </div>
      <template #footer>
        <Button :label="t('common.close')" icon="pi pi-times" text @click="showShareDialog = false" />
        <Button v-if="shareToken" :label="t('keys.disableLink')" icon="pi pi-ban" severity="danger" text @click="handleCancelShareLink" />
        <Button :label="t('keys.copyLink')" icon="pi pi-copy" :disabled="!shareLink" @click="copyShareLink" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import type { Key } from '@/models/Key';
import { CURRENT_USE_VALUES } from '@/models/Key';
import { addKey, updateKey, removeKey, createShareLink, cancelShareLink } from '../api/keys'
import { useTableRowsPerPage } from '@/composables/useTableRowsPerPage'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ keys: Key[], gameId: number | null }>()
const emit = defineEmits(['refresh'])

const toast = useToast()
const { t } = useI18n()
const newKey = ref('')
const newCurrentUse = ref('')
const editingKey = ref<string | null>(null)
const editKeyValue = ref('')
const editCurrentUse = ref('')
const editUsed = ref(false)

const { rowsPerPage, containerRef: tableContainer } = useTableRowsPerPage()

const showAddKeyDialog = ref(false)
const showEditKeyDialog = ref(false)
const showDeleteKeyDialog = ref(false)
const showShareDialog = ref(false)
const keyToDelete = ref<Key | null>(null)
const keyToEdit = ref<Key | null>(null)
const keyToShare = ref<Key | null>(null)
const shareLink = ref('')
const shareExpiresAt = ref('')
const shareToken = ref('')
const currentUseOptions = computed(() => {
  return CURRENT_USE_VALUES.map((value) => {
    const key = value.toLowerCase()
    return {
      label: t(`keys.currentUse.${key}`),
      value
    }
  })
})

function openEditDialog(key: Key) {
  keyToEdit.value = key
  editKeyValue.value = key.key
  editCurrentUse.value = key.current_use || ''
  editUsed.value = key.used
  showEditKeyDialog.value = true
}

function openDeleteDialog(key: Key) {
  keyToDelete.value = key
  showDeleteKeyDialog.value = true
}

async function saveEditKey() {
  if (!keyToEdit.value || !props.gameId) return
  await updateKey(props.gameId, keyToEdit.value.id, { key: editKeyValue.value, used: editUsed.value, current_use: editCurrentUse.value })
  showEditKeyDialog.value = false
  emit('refresh')
}

async function confirmDeleteKey() {
  if (!keyToDelete.value || !props.gameId) return
  await removeKey(props.gameId, keyToDelete.value.id)
  showDeleteKeyDialog.value = false
  emit('refresh')
}

async function openShareDialog(key: Key) {
  if (!props.gameId) return
  keyToShare.value = key
  const data = await createShareLink(key.id, key.key)
  shareLink.value = data.share_url || ''
  shareExpiresAt.value = data.expires_at || ''
  shareToken.value = data.token || ''
  showShareDialog.value = true
}

async function handleCancelShareLink() {
  if (!keyToShare.value) return
  try {
    await cancelShareLink(keyToShare.value.id)
    shareLink.value = ''
    shareExpiresAt.value = ''
    shareToken.value = ''
    showShareDialog.value = false
    emit('refresh')
    toast.add({ severity: 'success', summary: t('keys.linkDisabled'), detail: t('keys.linkDisabledDetail'), life: 2000 })
  } catch (err) {
    console.error('Failed to disable share link:', err)
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('keys.disableFailed'), life: 2000 })
  }
}

async function copyShareLink() {
  if (!shareLink.value) return
  try {
    await navigator.clipboard.writeText(shareLink.value)
    toast.add({ severity: 'success', summary: t('share.copied'), detail: t('keys.shareCopied'), life: 2000 })
  } catch (err) {
    console.error('Failed to copy share link:', err)
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('keys.copyShareFailed'), life: 2000 })
  }
}

async function copyKey(key: string) {
  try {
    await navigator.clipboard.writeText(key)
    toast.add({ severity: 'success', summary: t('share.copied'), detail: t('keys.keyCopied'), life: 2000 })
  } catch (err) {
    console.error('Failed to copy key:', err)
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('keys.copyFailed'), life: 2000 })
  }
}

async function handleAddKey() {
  if (!props.gameId || !newKey.value) return
  await addKey({ key: newKey.value, user_game_id: props.gameId, current_use: newCurrentUse.value })
  newKey.value = ''
  newCurrentUse.value = ''
  showAddKeyDialog.value = false
  emit('refresh')
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCurrentUseLabel(value: string | undefined) {
  const found = currentUseOptions.value.find(opt => opt.value === value)
  return found ? found.label : ''
}

function getUsageClass(value: string | undefined) {
  if (!value) return 'none'
  return value.toLowerCase().replace(/\s+/g, '-')
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
}

.datatable-wrapper {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.key-text {
  font-family: monospace;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
}

.usage-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-stack {
  display: inline-flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: center;
}

.status-badge.used {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.available {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.sharing {
  background: #fef3c7;
  color: #92400e;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.confirmation-content {
  display: flex;
  align-items: center;
  padding: 1rem 0;
}

/* Form Styles */
.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.field-checkbox label {
  margin-bottom: 0;
  cursor: pointer;
}

.hint {
  display: inline-block;
  margin-top: 0.5rem;
  color: var(--text-secondary);
}
</style>