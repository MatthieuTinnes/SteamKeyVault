import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Composable to automatically calculate and update rows per page based on available height
 * @param baseOffset - Base offset in pixels to subtract from available height (default: 550)
 * @param rowHeight - Height of each row in pixels (default: 80)
 * @param minRows - Minimum number of rows to display (default: 1)
 * @returns Object with rowsPerPage ref and containerRef to attach to the table wrapper
 */
export function useTableRowsPerPage(
  baseOffset: number = 550,
  rowHeight: number = 80,
  minRows: number = 1
) {
  const rowsPerPage = ref(4)
  const containerRef = ref<HTMLElement | null>(null)
  let resizeObserver: ResizeObserver | null = null

  function computeRowsPerPage(height: number): number {
    return Math.max(minRows, Math.floor((height - baseOffset) / rowHeight))
  }

  function updateRowsFromContainer() {
    rowsPerPage.value = computeRowsPerPage(window.innerHeight)
  }

  onMounted(() => {
    updateRowsFromContainer()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateRowsFromContainer)
    }
    
    if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
      resizeObserver = new ResizeObserver(() => updateRowsFromContainer())
      resizeObserver.observe(containerRef.value)
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateRowsFromContainer)
    }
    
    if (resizeObserver && containerRef.value) {
      resizeObserver.disconnect()
    }
  })

  return {
    rowsPerPage,
    containerRef
  }
}
