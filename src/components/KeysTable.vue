<template>
  <div class="keys-table">
    <!-- Toolbar for Add Key -->
    <div class="toolbar">
      <Button label="Add Key" icon="pi pi-plus" class="p-button-sm p-button-success" @click="showAddKeyDialog = true" :disabled="!gameId" :tooltip="!gameId ? 'Please select a game first' : undefined" />
    </div>
    <DataTable :value="keys" tableStyle="min-width: 50rem" paginator :rows="6" striped-rows>
      <template #empty>
            <p>Add a key to start</p>
      </template>
      <Column field="key" header="Key">
        <template #body="{ data }">
          <template v-if="editingKey === data.key">
            <InputText v-model="editKeyValue" class="edit-key-input" />
          </template>
          <template v-else>
            {{ data.key }}
          </template>
        </template>
      </Column>
      <Column sortable field="date_added" header="Date added">
        <template #body="{ data }">
          {{ formatDate(data.date_added) }}
        </template>
      </Column>
      <Column sortable field="current_use" header="Current use">
        <template #body="{ data }">
          <template v-if="editingKey === data.key">
            <Dropdown v-model="editCurrentUse" :options="CURRENT_USE_OPTIONS" optionLabel="label" optionValue="value"
              placeholder="Select usage" class="edit-key-input" />
          </template>
          <template v-else>
            {{ getCurrentUseLabel(data.current_use) }}
          </template>
        </template>
      </Column>
      <Column sortable field="used" header="Used">
        <template #body="{ data }">
          <template v-if="editingKey === data.key">
            <Checkbox v-model="editUsed" :binary="true" />
          </template>
          <template v-else>
            <span v-if="data.used">
              <i class="pi pi-check used-icon" aria-label="Used"></i>
            </span>
            <span v-else>
              <i class="pi pi-times unused-icon" aria-label="Not used"></i>
            </span>
          </template>
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <Button class="p-button-sm p-button-info" @click="openEditDialog(data)"><i
              class="pi pi-pencil"></i></Button>
          <Button class="p-button-sm p-button-danger" @click="openDeleteDialog(data)"><i
              class="pi pi-trash"></i></Button>
        </template>
      </Column>
    </DataTable>

    <!-- Add Key Dialog -->
    <Dialog v-model:visible="showAddKeyDialog" :style="{ width: '400px' }" header="Add Key" :modal="true">
      <div class="form-column float-label">
        <FloatLabel variant="on" >
          <InputText id="add_key" v-model="newKey" class="add-key-input" />
          <label for="add_key">Key</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <Dropdown id="add_current_use" v-model="newCurrentUse" :options="CURRENT_USE_OPTIONS" optionLabel="label"
            optionValue="value" class="add-key-input" />
          <label for="add_current_use">Current use</label>
        </FloatLabel>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showAddKeyDialog = false" />
        <Button label="Add" icon="pi pi-check" :disabled="!newKey || !gameId" @click="handleAddKey" />
      </template>
    </Dialog>

    <!-- Edit Key Dialog -->
    <Dialog v-model:visible="showEditKeyDialog" :style="{ width: '400px' }" header="Edit Key" :modal="true">
      <div class="form-column float-label">
        <FloatLabel variant="on">
          <InputText id="edit_key" v-model="editKeyValue" class="edit-key-input" />
          <label for="edit_key">Key</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <Dropdown id="edit_current_use" v-model="editCurrentUse" :options="CURRENT_USE_OPTIONS" optionLabel="label"
            optionValue="value" class="edit-key-input" />
          <label for="edit_current_use">Current use</label>
        </FloatLabel>
        <div class="checkbox-row">
          <Checkbox v-model="editUsed" :binary="true" id="edit_used" />
          <label for="edit_used">Used</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showEditKeyDialog = false" />
        <Button label="Save" icon="pi pi-check" @click="saveEditKey" />
      </template>
    </Dialog>

    <!-- Delete Key Dialog -->
    <Dialog v-model:visible="showDeleteKeyDialog" :style="{ width: '350px' }" header="Confirm Delete" :modal="true">
      <div class="confirm-row">
        <i class="pi pi-exclamation-triangle confirm-icon" />
        <span>Are you sure you want to delete this key?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="showDeleteKeyDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="confirmDeleteKey" />
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
import Message from 'primevue/message';
import Dialog from 'primevue/dialog';
import FloatLabel from 'primevue/floatlabel';
import Dropdown from 'primevue/dropdown';
import type { Key } from '@/models/Key';
import { CURRENT_USE_OPTIONS } from '@/models/Key';
import { addKey, updateKey, removeKey } from '../api/keys'

const props = defineProps<{ keys: Key[], gameId: number | null }>()
const emit = defineEmits(['refresh'])

const newKey = ref('')
const newCurrentUse = ref('')
const editingKey = ref<string | null>(null)
const editKeyValue = ref('')
const editCurrentUse = ref('')
const editUsed = ref(false)

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
  if (!keyToEdit.value) return
  await updateKey(props.gameId, keyToEdit.value.id, { key: editKeyValue.value, used: editUsed.value, current_use: editCurrentUse.value })
  showEditKeyDialog.value = false
  emit('refresh')
}

async function confirmDeleteKey() {
  if (!keyToDelete.value) return
  await removeKey(props.gameId, keyToDelete.value.id)
  showDeleteKeyDialog.value = false
  emit('refresh')
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
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCurrentUseLabel(value: string | undefined) {
  const found = CURRENT_USE_OPTIONS.find(opt => opt.value === value)
  return found ? found.label : ''
}
</script>

<style scoped>
.float-label {
  margin-top: 0.3rem;
}

.add-key-input,
.edit-key-input,
.p-float-label .p-inputtext {
  width: 100%;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 1em;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confirm-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.confirm-icon {
  font-size: 1.5rem;
  color: #f59e0b; /* amber-ish like warning */
}

.used-icon {
  color: #16a34a; /* green */
}

.unused-icon {
  color: #dc2626; /* red */
}
</style>