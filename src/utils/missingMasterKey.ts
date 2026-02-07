import { logoutUser } from '@/api/auth'
import { useCryptoStore } from '@/stores/crypto'
import { useUserStore } from '@/stores/user'
import { showErrorToast } from '@/utils/toast'

export async function handleMissingMasterKey() {
  showErrorToast('Missing master key', 'Please log in again.')
  try {
    await logoutUser()
  } catch (error) {
    useCryptoStore().clearMasterKey()
    useUserStore().clearUser()
  }
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}
