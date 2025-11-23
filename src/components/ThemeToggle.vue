<template>
  <div class="theme-toggle-wrapper">
    <div class="theme-toggle-item" @click="handleToggle">
      <i :class="themeIcon"></i>
      <span>{{ themeLabel }}</span>
      <InputSwitch 
        v-model="isDarkMode"
        class="theme-switch"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputSwitch from 'primevue/inputswitch'
import { useTheme } from '../composables/useTheme'

const { currentTheme, toggleTheme } = useTheme()

const isDarkMode = computed({
  get: () => currentTheme.value === 'dark',
  set: () => {
    // Le toggle est géré par handleToggle
  }
})

const themeIcon = computed(() => {
  return currentTheme.value === 'dark' ? 'pi pi-moon' : 'pi pi-sun'
})

const themeLabel = computed(() => {
  return currentTheme.value === 'dark' ? 'Dark Mode' : 'Light Mode'
})

const handleToggle = () => {
  toggleTheme()
}
</script>

<style scoped>
.theme-toggle-wrapper {
  width: 100%;
  padding: 0;
}

.theme-toggle-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9375rem;
}

.theme-toggle-item:hover {
  background: var(--bg-tertiary);
  padding-left: 1.5rem;
}

.theme-toggle-item i {
  font-size: 1.125rem;
  width: 1.25rem;
  text-align: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.theme-toggle-item span {
  flex: 1;
  color: var(--text-secondary);
}

.theme-switch {
  flex-shrink: 0;
  pointer-events: none;
}
</style>
