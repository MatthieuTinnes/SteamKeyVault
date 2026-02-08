import { logoutUser } from '@/api/auth'
import { useCryptoStore } from '@/stores/crypto'
import { useUserStore } from '@/stores/user'
import { showErrorToast } from '@/utils/toast'
import { i18n } from '@/i18n'

export async function handleMissingMasterKey() {
  showErrorToast(i18n.global.t('errors.missingMasterKey'), i18n.global.t('errors.loginAgain'))
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
