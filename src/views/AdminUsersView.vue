<template>
  <div class="admin-users">
    <div class="header">
      <h2><i class="pi pi-users"></i> {{ t('admin.users.title') }}</h2>
      <Button :label="t('admin.users.backToDashboard')" icon="pi pi-arrow-left" @click="router.push(`/${locale}/admin`)" severity="secondary" />
    </div>

    <div class="search-bar">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchQuery" :placeholder="t('admin.users.searchPlaceholder')" @input="onSearch" />
      </IconField>
    </div>

    <div ref="tableContainer">
      <DataTable
        :value="users"
        :loading="loading"
        stripedRows
        lazy
        paginator
        :rows="rowsPerPage"
        :totalRecords="totalRecords"
        @page="onPage"
      >
        <Column field="id" :header="t('admin.users.id')" sortable style="width: 5rem"></Column>
        <Column field="username" :header="t('admin.users.username')" sortable></Column>
        <Column field="email" :header="t('admin.users.email')" sortable></Column>
        <Column field="email_verified" :header="t('admin.users.verified')" sortable style="width: 7rem">
          <template #body="{ data }">
            <i v-if="data.email_verified" class="pi pi-check-circle" style="color: #059669"></i>
            <i v-else class="pi pi-times-circle" style="color: #dc2626"></i>
          </template>
        </Column>
        <Column field="is_admin" :header="t('admin.users.admin')" sortable style="width: 6rem">
          <template #body="{ data }">
            <i v-if="data.is_admin" class="pi pi-shield" style="color: #dc2626"></i>
          </template>
        </Column>
        <Column field="games_count" :header="t('admin.users.games')" sortable style="width: 6rem"></Column>
        <Column field="keys_count" :header="t('admin.users.keys')" sortable style="width: 6rem"></Column>
        <Column field="date_joined" :header="t('admin.users.joined')" sortable style="width: 10rem">
          <template #body="{ data }">
            {{ formatDate(data.date_joined) }}
          </template>
        </Column>
        <Column field="last_login" :header="t('admin.users.lastLogin')" sortable style="width: 10rem">
          <template #body="{ data }">
            {{ data.last_login ? formatDate(data.last_login) : '—' }}
          </template>
        </Column>
        <Column :header="t('admin.users.actions')" style="width: 10rem">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button class="p-button-text p-button p-button-info" @click="editUser(data)"><i
              class="pi pi-pencil"></i></Button>
              <Button class="p-button-text p-button p-button-warning" @click="confirmClear(data)"><i
              class="pi pi-times-circle"></i></Button>
              <Button class="p-button-text p-button p-button-danger" @click="confirmDelete(data)"><i
              class="pi pi-trash"></i></Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showEditDialog" :header="t('admin.users.editUser')" :modal="true" :style="{ width: '30rem' }">
      <div v-if="editingUser" class="edit-form">
        <div class="form-group">
          <label>{{ t('admin.users.username') }}</label>
          <InputText v-model="editingUser.username" disabled />
        </div>
        
        <div class="form-group">
          <label>{{ t('admin.users.email') }}</label>
          <InputText v-model="editForm.email" type="email" />
        </div>
        
        <div class="form-group">
          <label>{{ t('admin.users.newPasswordHint') }}</label>
          <InputText v-model="editForm.password" type="password" />
        </div>
        
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 0.5rem">
            <Checkbox v-model="editForm.is_admin" :binary="true" />
            {{ t('admin.users.adminPrivileges') }}
          </label>
        </div>
      </div>
      
      <template #footer>
        <Button :label="t('common.cancel')" @click="showEditDialog = false" severity="secondary" />
        <Button :label="t('admin.users.saveChanges')" @click="saveUser" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showDeleteDialog" :header="t('admin.users.confirmDelete')" :modal="true" :style="{ width: '25rem' }">
      <p v-if="deletingUser">
        {{ t('admin.users.deleteUserPrompt', { username: deletingUser.username }) }}
      </p>
      <template #footer>
        <Button :label="t('common.cancel')" @click="showDeleteDialog = false" severity="secondary" />
        <Button :label="t('common.delete')" @click="deleteUserConfirmed" severity="danger" :loading="deleting" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showClearDialog" :header="t('admin.users.confirmClear')" :modal="true" :style="{ width: '28rem' }">
      <p v-if="clearingUser">
        {{ t('admin.users.clearUserPrompt', { username: clearingUser.username }) }}
      </p>
      <template #footer>
        <Button :label="t('common.cancel')" @click="showClearDialog = false" severity="secondary" />
        <Button :label="t('admin.users.deleteGamesKeys')" @click="clearUserGamesAndKeys" severity="warning" :loading="clearing" />
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
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import {
  getAllUsers,
  updateUserEmail,
  updateUserPassword,
  updateUserAdminStatus,
  deleteUser,
  deleteUserGamesAndKeys
} from '@/api/admin'
import type { AdminUser } from '@/api/admin'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { useTableRowsPerPage } from '@/composables/useTableRowsPerPage'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const users = ref<AdminUser[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const currentOffset = ref(0)
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const showClearDialog = ref(false)
const editingUser = ref<AdminUser | null>(null)
const deletingUser = ref<AdminUser | null>(null)
const clearingUser = ref<AdminUser | null>(null)
const saving = ref(false)
const deleting = ref(false)
const clearing = ref(false)
const { t, locale } = useI18n()

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
    const response = await getAllUsers(rowsPerPage.value, currentOffset.value, searchQuery.value || undefined)
    users.value = response.data.users
    totalRecords.value = response.data.total
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || t('admin.users.failedLoadUsers'))
  } finally {
    loading.value = false
  }
}

function onPage(event: { first: number; rows: number }) {
  currentOffset.value = event.first
  loadUsers()
}

function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentOffset.value = 0
    loadUsers()
  }, 300)
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
    
    showSuccessToast(t('admin.users.userUpdated'))
    showEditDialog.value = false
    await loadUsers()
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || t('admin.users.failedUpdateUser'))
  } finally {
    saving.value = false
  }
}

function confirmDelete(user: AdminUser) {
  deletingUser.value = user
  showDeleteDialog.value = true
}

function confirmClear(user: AdminUser) {
  clearingUser.value = user
  showClearDialog.value = true
}

async function deleteUserConfirmed() {
  if (!deletingUser.value) return
  
  deleting.value = true
  try {
    await deleteUser(deletingUser.value.id)
    showSuccessToast(t('admin.users.userDeleted'))
    showDeleteDialog.value = false
    await loadUsers()
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || t('admin.users.failedDeleteUser'))
  } finally {
    deleting.value = false
  }
}

async function clearUserGamesAndKeys() {
  if (!clearingUser.value) return

  clearing.value = true
  try {
    const response = await deleteUserGamesAndKeys(clearingUser.value.id)
    const deletedGames = response.data?.deleted_games
    const deletedKeys = response.data?.deleted_keys
    const details =
      typeof deletedGames === 'number' && typeof deletedKeys === 'number'
        ? t('admin.users.deletedGamesKeys', { games: deletedGames, keys: deletedKeys })
        : t('admin.users.deletedGamesKeysFallback')
    showSuccessToast(details)
    showClearDialog.value = false
    await loadUsers()
  } catch (error: any) {
    showErrorToast(error?.response?.data?.error || t('admin.users.failedDeleteGamesKeys'))
  } finally {
    clearing.value = false
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' })
}
</script>

<style scoped>
.admin-users {
  max-width: 90rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.search-bar {
  margin-bottom: 1rem;
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
