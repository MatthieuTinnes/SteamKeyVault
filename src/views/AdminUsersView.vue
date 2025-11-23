<template>
  <div class="admin-users">
    <div class="header">
      <h2><i class="pi pi-users"></i> User Management</h2>
      <Button label="Back to Dashboard" icon="pi pi-arrow-left" @click="router.push('/admin')" severity="secondary" />
    </div>

    <div ref="tableContainer">
      <DataTable :value="users" :loading="loading" stripedRows paginator :rows="rowsPerPage">
        <Column field="id" header="ID" sortable style="width: 5rem"></Column>
        <Column field="username" header="Username" sortable></Column>
        <Column field="email" header="Email" sortable></Column>
        <Column field="email_verified" header="Verified" sortable style="width: 7rem">
          <template #body="{ data }">
            <i v-if="data.email_verified" class="pi pi-check-circle" style="color: #059669"></i>
            <i v-else class="pi pi-times-circle" style="color: #dc2626"></i>
          </template>
        </Column>
        <Column field="is_admin" header="Admin" sortable style="width: 6rem">
          <template #body="{ data }">
            <i v-if="data.is_admin" class="pi pi-shield" style="color: #dc2626"></i>
          </template>
        </Column>
        <Column field="games_count" header="Games" sortable style="width: 6rem"></Column>
        <Column field="keys_count" header="Keys" sortable style="width: 6rem"></Column>
        <Column field="date_joined" header="Joined" sortable style="width: 10rem">
          <template #body="{ data }">
            {{ formatDate(data.date_joined) }}
          </template>
        </Column>
        <Column header="Actions" style="width: 10rem">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button class="p-button-sm p-button-info" @click="editUser(data)"><i
              class="pi pi-pencil"></i></Button>
              <Button class="p-button-sm p-button-danger" @click="confirmDelete(data)"><i
              class="pi pi-trash"></i></Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showEditDialog" header="Edit User" :modal="true" :style="{ width: '30rem' }">
      <div v-if="editingUser" class="edit-form">
        <div class="form-group">
          <label>Username</label>
          <InputText v-model="editingUser.username" disabled />
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <InputText v-model="editForm.email" type="email" />
        </div>
        
        <div class="form-group">
          <label>New Password (leave empty to keep current)</label>
          <InputText v-model="editForm.password" type="password" />
        </div>
        
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 0.5rem">
            <Checkbox v-model="editForm.is_admin" :binary="true" />
            Admin Privileges
          </label>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" @click="showEditDialog = false" severity="secondary" />
        <Button label="Save Changes" @click="saveUser" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showDeleteDialog" header="Confirm Delete" :modal="true" :style="{ width: '25rem' }">
      <p v-if="deletingUser">
        Are you sure you want to delete user <strong>{{ deletingUser.username }}</strong>?
        This action cannot be undone.
      </p>
      <template #footer>
        <Button label="Cancel" @click="showDeleteDialog = false" severity="secondary" />
        <Button label="Delete" @click="deleteUserConfirmed" severity="danger" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import { getAllUsers, updateUserEmail, updateUserPassword, updateUserAdminStatus, deleteUser } from '@/api/admin'
import type { AdminUser } from '@/api/admin'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { useTableRowsPerPage } from '@/composables/useTableRowsPerPage'

const router = useRouter()
const users = ref<AdminUser[]>([])
const loading = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingUser = ref<AdminUser | null>(null)
const deletingUser = ref<AdminUser | null>(null)
const saving = ref(false)
const deleting = ref(false)

const { rowsPerPage, containerRef: tableContainer } = useTableRowsPerPage(350)

const editForm = ref({
  email: '',
  password: '',
  is_admin: false
})

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    const response = await getAllUsers()
    users.value = response.data.users
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || 'Failed to load users')
  } finally {
    loading.value = false
  }
}

function editUser(user: AdminUser) {
  editingUser.value = user
  editForm.value = {
    email: user.email,
    password: '',
    is_admin: user.is_admin
  }
  showEditDialog.value = true
}

async function saveUser() {
  if (!editingUser.value) return
  
  saving.value = true
  try {
    const promises = []
    
    if (editForm.value.email !== editingUser.value.email) {
      promises.push(updateUserEmail(editingUser.value.id, editForm.value.email))
    }
    
    if (editForm.value.password) {
      promises.push(updateUserPassword(editingUser.value.id, editForm.value.password))
    }
    
    if (editForm.value.is_admin !== editingUser.value.is_admin) {
      promises.push(updateUserAdminStatus(editingUser.value.id, editForm.value.is_admin))
    }
    
    await Promise.all(promises)
    
    showSuccessToast('User updated successfully')
    showEditDialog.value = false
    await loadUsers()
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || 'Failed to update user')
  } finally {
    saving.value = false
  }
}

function confirmDelete(user: AdminUser) {
  deletingUser.value = user
  showDeleteDialog.value = true
}

async function deleteUserConfirmed() {
  if (!deletingUser.value) return
  
  deleting.value = true
  try {
    await deleteUser(deletingUser.value.id)
    showSuccessToast('User deleted successfully')
    showDeleteDialog.value = false
    await loadUsers()
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || 'Failed to delete user')
  } finally {
    deleting.value = false
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.admin-users {
  max-width: 90rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
}
</style>
