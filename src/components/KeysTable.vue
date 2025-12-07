<template>
  <div class="keys-table">
    <!-- Toolbar for Add Key -->
    <div class="toolbar">
      <Button label="Add Key" icon="pi pi-plus" @click="showAddKeyDialog = true" :disabled="!gameId" :tooltip="!gameId ? 'Please select a game first' : undefined" />
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
          <p>No keys found. Add a key to start.</p>
        </div>
      </template>
      <Column field="key" header="Key">
        <template #body="{ data }">
          <span class="key-text">{{ data.key }}</span>
        </template>
      </Column>
      <Column sortable field="date_added" header="Date Added">
        <template #body="{ data }">
          {{ formatDate(data.date_added) }}
        </template>
      </Column>
      <Column sortable field="current_use" header="Usage">
        <template #body="{ data }">
          <span class="usage-badge" :class="getUsageClass(data.current_use)">
            {{ getCurrentUseLabel(data.current_use) }}
          </span>
        </template>
      </Column>
      <Column sortable field="used" header="Status" style="width: 8rem; text-align: center">
        <template #body="{ data }">
          <span v-if="data.used" class="status-badge used">
            <i class="pi pi-check-circle"></i> Used
          </span>
          <span v-else class="status-badge available">
            <i class="pi pi-circle"></i> Available
          </span>
        </template>
      </Column>
      <Column header="Actions" style="width: 10rem; text-align: right">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button icon="pi pi-copy" class="p-button-text p-button p-button-secondary" @click="copyKey(data.key)" v-tooltip.top="'Copy Key'" />
            <Button icon="pi pi-pencil" class="p-button-text p-button p-button-info" @click="openEditDialog(data)" v-tooltip.top="'Edit'" />
            <Button icon="pi pi-trash" class="p-button-text p-button p-button-danger" @click="openDeleteDialog(data)" v-tooltip.top="'Delete'" />
          </div>
        </template>
      </Column>
      </DataTable>
    </div>

    <!-- Add Key Dialog -->
    <Dialog v-model:visible="showAddKeyDialog" header="Add Key" :modal="true" :style="{ width: 'min(30rem, 90vw)' }" class="p-fluid">
      <div class="field">
        <label for="add_key">Key</label>
        <InputText id="add_key" v-model="newKey" placeholder="XXXXX-XXXXX-XXXXX" />
      </div>
      <div class="field">
        <label for="add_current_use">Usage (Optional)</label>
        <Dropdown id="add_current_use" v-model="newCurrentUse" :options="CURRENT_USE_OPTIONS" optionLabel="label" optionValue="value" placeholder="Select usage" />
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showAddKeyDialog = false" />
        <Button label="Add Key" icon="pi pi-check" :disabled="!newKey || !gameId" @click="handleAddKey" />
      </template>
    </Dialog>

    <!-- Edit Key Dialog -->
    <Dialog v-model:visible="showEditKeyDialog" header="Edit Key" :modal="true" :style="{ width: 'min(30rem, 90vw)' }" class="p-fluid">
      <div class="field">
        <label for="edit_key">Key</label>
        <InputText id="edit_key" v-model="editKeyValue" />
      </div>
      <div class="field">
        <label for="edit_current_use">Usage</label>
        <Dropdown id="edit_current_use" v-model="editCurrentUse" :options="CURRENT_USE_OPTIONS" optionLabel="label" optionValue="value" placeholder="Select usage" />
      </div>
      <div class="field-checkbox">
        <Checkbox v-model="editUsed" :binary="true" inputId="edit_used" />
        <label for="edit_used">Mark as Used</label>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showEditKeyDialog = false" />
        <Button label="Save Changes" icon="pi pi-check" @click="saveEditKey" />
      </template>
    </Dialog>

    <!-- Delete Key Dialog -->
    <Dialog v-model:visible="showDeleteKeyDialog" header="Confirm Delete" :modal="true" :style="{ width: 'min(25rem, 90vw)' }">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: #ef4444" />
        <span>Are you sure you want to delete this key? This action cannot be undone.</span>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showDeleteKeyDialog = false" />
        <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteKey" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import type { Key } from '@/models/Key';
import { CURRENT_USE_OPTIONS } from '@/models/Key';
import { addKey, updateKey, removeKey } from '../api/keys'
import { useTableRowsPerPage } from '@/composables/useTableRowsPerPage'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{ keys: Key[], gameId: number | null }>()
const emit = defineEmits(['refresh'])

const toast = useToast()
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
const keyToDelete = ref<Key | null>(null)
const keyToEdit = ref<Key | null>(null)

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

async function copyKey(key: string) {
  try {
    await navigator.clipboard.writeText(key)
    toast.add({ severity: 'success', summary: 'Copied', detail: 'Key copied to clipboard', life: 2000 })
  } catch (err) {
    console.error('Failed to copy key:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy key', life: 2000 })
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

function getCurrentUseLabel(value: string | undefined) {
  const found = CURRENT_USE_OPTIONS.find(opt => opt.value === value)
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

.status-badge.used {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.available {
  background: #d1fae5;
  color: #065f46;
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
</style>