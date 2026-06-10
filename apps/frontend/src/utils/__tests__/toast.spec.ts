import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setGlobalToast, showErrorToast, showSuccessToast } from '../toast'

describe('toast utilities', () => {
  beforeEach(() => {
    // Reset to no toast between tests
    setGlobalToast(null)
  })

  describe('showErrorToast', () => {
    it('calls globalToast.add with severity "error"', () => {
      const mockToast = { add: vi.fn() }
      setGlobalToast(mockToast)

      showErrorToast('Something went wrong', 'Details here')

      expect(mockToast.add).toHaveBeenCalledOnce()
      expect(mockToast.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Something went wrong',
        detail: 'Details here',
        life: 5000,
      })
    })

    it('calls globalToast.add without detail when omitted', () => {
      const mockToast = { add: vi.fn() }
      setGlobalToast(mockToast)

      showErrorToast('Error summary')

      expect(mockToast.add).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Error summary' }),
      )
    })

    it('logs to console when toast is not initialized', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      showErrorToast('No toast set')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('showSuccessToast', () => {
    it('calls globalToast.add with severity "success"', () => {
      const mockToast = { add: vi.fn() }
      setGlobalToast(mockToast)

      showSuccessToast('Done!', 'Operation completed')

      expect(mockToast.add).toHaveBeenCalledOnce()
      expect(mockToast.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Done!',
        detail: 'Operation completed',
        life: 4000,
      })
    })

    it('logs to console when toast is not initialized', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      showSuccessToast('No toast set')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
