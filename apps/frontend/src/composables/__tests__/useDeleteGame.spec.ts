import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, createApp } from 'vue'

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/api/keys', () => ({
  getKeysForGame: vi.fn(),
}))

vi.mock('@/api/games', () => ({
  removeUserGame: vi.fn(),
}))

import { getKeysForGame } from '@/api/keys'
import { removeUserGame } from '@/api/games'
import { useDeleteGame } from '../useDeleteGame'

function withSetup<T>(composable: () => T): T {
  let result!: T
  const app = createApp(
    defineComponent({
      setup() {
        result = composable()
        return {}
      },
      template: '<div />',
    }),
  )
  app.mount(document.createElement('div'))
  return result
}

describe('useDeleteGame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with modal hidden and hasKeys false', () => {
    const { showDeleteModal, hasKeys } = withSetup(useDeleteGame)
    expect(showDeleteModal.value).toBe(false)
    expect(hasKeys.value).toBe(false)
  })

  describe('openDelete', () => {
    it('shows modal and sets hasKeys to true when keys exist', async () => {
      vi.mocked(getKeysForGame).mockResolvedValue([{ id: 1, key: 'ABC' }])

      const { openDelete, showDeleteModal, hasKeys } = withSetup(useDeleteGame)
      await openDelete(42)

      expect(showDeleteModal.value).toBe(true)
      expect(hasKeys.value).toBe(true)
      expect(getKeysForGame).toHaveBeenCalledWith(42)
    })

    it('shows modal and sets hasKeys to false when no keys', async () => {
      vi.mocked(getKeysForGame).mockResolvedValue([])

      const { openDelete, showDeleteModal, hasKeys } = withSetup(useDeleteGame)
      await openDelete(42)

      expect(showDeleteModal.value).toBe(true)
      expect(hasKeys.value).toBe(false)
    })

    it('sets hasKeys to false when userGameId is null', async () => {
      const { openDelete, hasKeys } = withSetup(useDeleteGame)
      await openDelete(null)
      expect(hasKeys.value).toBe(false)
    })

    it('sets hasKeys to false on error', async () => {
      vi.mocked(getKeysForGame).mockRejectedValue(new Error('fail'))

      const { openDelete, hasKeys } = withSetup(useDeleteGame)
      await openDelete(10)

      expect(hasKeys.value).toBe(false)
    })
  })

  describe('confirmDelete', () => {
    it('returns false when userGameId is null', async () => {
      const { confirmDelete } = withSetup(useDeleteGame)
      const result = await confirmDelete(null)
      expect(result).toBe(false)
    })

    it('calls removeUserGame and returns true on success', async () => {
      vi.mocked(removeUserGame).mockResolvedValue(undefined)

      const { confirmDelete } = withSetup(useDeleteGame)
      const result = await confirmDelete(5)

      expect(removeUserGame).toHaveBeenCalledWith(5)
      expect(result).toBe(true)
    })

    it('returns false on API error', async () => {
      vi.mocked(removeUserGame).mockRejectedValue(new Error('network'))

      const { confirmDelete } = withSetup(useDeleteGame)
      const result = await confirmDelete(5)

      expect(result).toBe(false)
    })
  })

  describe('onModalUpdate', () => {
    it('updates showDeleteModal value', () => {
      const { onModalUpdate, showDeleteModal } = withSetup(useDeleteGame)
      onModalUpdate(true)
      expect(showDeleteModal.value).toBe(true)
      onModalUpdate(false)
      expect(showDeleteModal.value).toBe(false)
    })
  })
})
