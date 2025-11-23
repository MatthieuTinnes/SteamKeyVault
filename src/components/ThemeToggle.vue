<template>
  <div class="theme-toggle-wrapper">
    <div class="theme-toggle-item" @click="handleToggle">
      <i :class="themeIcon"></i>
      <span>{{ themeLabel }}</span>
      <InputSwitch 
        v-model="isDarkMode" 
        @change="handleToggle"
        class="theme-switch"
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
}

.theme-toggle-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 6px;
}

.theme-toggle-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.my-app-dark .theme-toggle-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.theme-toggle-item i {
  font-size: 1.125rem;
  color: var(--text-color);
  width: 1.25rem;
  flex-shrink: 0;
}

.theme-toggle-item span {
  flex: 1;
  color: var(--text-color);
  font-size: 0.9375rem;
}

.theme-switch {
  flex-shrink: 0;
}

/* Empêche la propagation du clic sur le switch */
.theme-switch :deep(.p-inputswitch) {
  pointer-events: none;
}
</style>
