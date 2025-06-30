<template>
  <div class="keys-table">
    <!-- Toolbar for Add Key -->
    <div class="mb-4 flex items-center gap-2">
      <Button label="Add Key" icon="pi pi-plus" class="p-button-sm p-button-success" @click="showAddKeyDialog = true" />
    </div>
    <DataTable :value="keys" tableStyle="min-width: 50rem" paginator :rows="10" striped-rows>
      <template #empty> <Message severity="info">No keys found.</Message> </template>
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
      <Column sortable field="date_added" header="Date added"></Column>
      <Column sortable field="current_use" header="Current use">
        <template #body="{ data }">
          <template v-if="editingKey === data.key">
            <InputText v-model="editCurrentUse" class="edit-key-input" />
          </template>
          <template v-else>
            {{ data.current_use }}
          </template>
        </template>
      </Column>
      <Column sortable field="used" header="Used">
        <template #body="{ data }">
          <template v-if="editingKey === data.key">
            <Checkbox v-model="editUsed" :binary="true" />
          </template>
          <template v-else>
            <span>{{ data.used ? 'Yes' : 'No' }}</span>
          </template>
        </template>
      </Column>
      <Column header="Actions" >
        <template #body="{ data }">
          <Button class="p-button-sm p-button-info mr-2" @click="openEditDialog(data)"><i class="pi pi-pencil"></i></Button>
          <Button class="p-button-sm p-button-danger" @click="openDeleteDialog(data)"><i class="pi pi-trash"></i></Button>
        </template>
      </Column>
    </DataTable>

    <!-- Add Key Dialog -->
    <Dialog v-model:visible="showAddKeyDialog" :style="{ width: '400px' }" header="Add Key" :modal="true">
      <div class="flex flex-col gap-4">
        <FloatLabel variant="on">
          <InputText id="add_key" v-model="newKey" class="add-key-input" />
          <label for="add_key">Key</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText id="add_current_use" v-model="newCurrentUse" class="add-key-input" />
          <label for="add_current_use">Current use (optional)</label>
        </FloatLabel>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showAddKeyDialog = false" />
        <Button label="Add" icon="pi pi-check" :disabled="!newKey || !gameId" @click="handleAddKey" />
      </template>
    </Dialog>

    <!-- Edit Key Dialog -->
    <Dialog v-model:visible="showEditKeyDialog" :style="{ width: '400px' }" header="Edit Key" :modal="true">
      <div class="flex flex-col gap-4">
        <FloatLabel variant="on">
          <InputText id="edit_key" v-model="editKeyValue" class="edit-key-input" />
          <label for="edit_key">Key</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText id="edit_current_use" v-model="editCurrentUse" class="edit-key-input" />
          <label for="edit_current_use">Current use (optional)</label>
        </FloatLabel>
        <div class="flex items-center gap-2">
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
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-2xl" />
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
import type { Key } from '@/models/Key';
import { addKey, updateKey, removeKey } from '../api/keys'

const props = defineProps<{ keys: Key[], gameId: number }>()
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
</script>

<style scoped>
.keys-table .p-button-sm {
  font-size: 0.9rem;
  padding: 0.3rem 0.8rem;
  margin-right: 0.5rem;
}
.keys-table .p-button-sm:last-child {
  margin-right: 0;
}

/* Fix for PrimeVue FloatLabel being masked in modal dialogs */
 .p-float-label {
  margin-top: 0.5rem;
}


</style>