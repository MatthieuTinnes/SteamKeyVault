let globalToast: any = null

export function setGlobalToast(t: any) {
  globalToast = t
}

export function showErrorToast(summary: string, detail?: string) {
  if (globalToast && typeof globalToast.add === 'function') {
    try {
      globalToast.add({ severity: 'error', summary, detail, life: 5000 })
    } catch (e) {
      // fallback to console if toast fails
      // eslint-disable-next-line no-console
      console.error('Failed to show toast', e, summary, detail)
    }
  } else {
    // eslint-disable-next-line no-console
    console.error('Toast not initialized:', summary, detail)
  }
}
