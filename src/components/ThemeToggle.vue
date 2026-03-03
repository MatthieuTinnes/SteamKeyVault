<template>
  <button class="theme-toggle-btn" @click="toggleTheme" :title="themeLabel">
    <i :class="themeIcon"></i>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useI18n } from 'vue-i18n'

const { currentTheme, toggleTheme } = useTheme()
const { t } = useI18n()

const themeIcon = computed(() => {
  return currentTheme.value === 'dark' ? 'pi pi-moon' : 'pi pi-sun'
})

const themeLabel = computed(() => {
  return currentTheme.value === 'dark' ? t('theme.dark') : t('theme.light')
})
</script>

<style scoped>
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.theme-toggle-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}
</style>
