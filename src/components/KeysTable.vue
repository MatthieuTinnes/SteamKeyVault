<template>
  <div class="keys-table">
    <h2>Your Steam Keys</h2>
    <div v-if="keys.length === 0" class="empty">
      <Message severity="info">No keys found.</Message>
    </div>
    <div class="add-key-row">
      <InputText v-model="newKey" placeholder="Key" class="add-key-input" />
      <InputText v-model="newCurrentUse" placeholder="Current use (optional)" class="add-key-input" />
      <Button label="Add" class="p-button-sm" @click="handleAdd" :disabled="!newKey || !gameId" />
    </div>
    <DataTable :value="keys" tableStyle="min-width: 50rem" striped-rows>
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
      <Column field="date_added" header="Date added"></Column>
      <Column field="current_use" header="Current use">
        <template #body="{ data }">
          <template v-if="editingKey === data.key">
            <InputText v-model="editCurrentUse" class="edit-key-input" />
          </template>
          <template v-else>
            {{ data.current_use }}
          </template>
        </template>
      </Column>
      <Column field="used" header="Used">
        <template #body="{ data }">
          <template v-if="editingKey === data.key">
            <Checkbox v-model="editUsed" :binary="true" />
          </template>
          <template v-else>
            <span>{{ data.used ? 'Yes' : 'No' }}</span>
          </template>
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <template v-if="editingKey === data.key">
            <Button label="Save" class="p-button-sm p-button-success" @click="saveEdit(data)" />
            <Button label="Cancel" class="p-button-sm p-button-secondary" @click="cancelEdit" />
          </template>
          <template v-else>
            <Button label="Edit" class="p-button-sm p-button-info" @click="startEdit(data)" />
            <Button label="Delete" class="p-button-sm p-button-danger" @click="handleRemove(data.key)" />
          </template>
        </template>
      </Column>
    </DataTable>
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

function startEdit(key: Key) {
  editingKey.value = key.key
  editKeyValue.value = key.key
  editCurrentUse.value = key.current_use || ''
  editUsed.value = key.used
}

function cancelEdit() {
  editingKey.value = null
}

async function saveEdit(key: Key) {
  await updateKey(props.gameId,key.key, { key: editKeyValue.value, used: editUsed.value, current_use: editCurrentUse.value })
  editingKey.value = null
  emit('refresh')
}

async function handleRemove(key: string) {
  await removeKey(props.gameId,key)
  emit('refresh')
}

async function handleAdd() {
  if (!props.gameId || !newKey.value) return
  await addKey({ key: newKey.value, user_game_id: props.gameId, current_use: newCurrentUse.value })
  newKey.value = ''
  newCurrentUse.value = ''
  emit('refresh')
}
</script>
<style scoped></style>