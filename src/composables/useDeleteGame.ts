import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getKeysForGame } from '@/api/keys'
import { removeUserGame } from '@/api/games'

export function useDeleteGame() {
  const showDeleteModal = ref(false)
  const hasKeys = ref(false)
  const toast = useToast()

  async function openDelete(userGameId?: number | null) {
    showDeleteModal.value = true
    try {
      const ugid = userGameId ?? null
      if (ugid) {
        const keys = await getKeysForGame(ugid)
        hasKeys.value = !!(keys && keys.length > 0)
      } else {
        hasKeys.value = false
      }
    } catch (e) {
      hasKeys.value = false
    }
  }

  async function confirmDelete(userGameId?: number | null) {
    const ugid = userGameId ?? null
    if (!ugid) {
      toast.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not determine game id', life: 3000 })
      return false
    }
    try {
      await removeUserGame(ugid)
      toast.add({ severity: 'success', summary: 'Deleted', detail: 'Game deleted', life: 3000 })
      return true
    } catch (e) {
      toast.add({ severity: 'error', summary: 'Delete Failed', detail: 'Failed to delete game', life: 3000 })
      return false
    }
  }

  function onModalUpdate(v: boolean) {
    showDeleteModal.value = v
  }

  return {
    showDeleteModal,
    hasKeys,
    openDelete,
    confirmDelete,
    onModalUpdate
  }
}
