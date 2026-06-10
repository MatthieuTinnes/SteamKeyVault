<template>
  <div class="locale-dropdown-wrapper" ref="wrapperRef">
    <button class="locale-trigger" @click="toggleOpen" :title="t('locale.label')">
      <span class="locale-name">{{ t(`locale.${currentLocale}`) }}</span>
      <i class="pi pi-chevron-down locale-chevron" :class="{ open: isOpen }"></i>
    </button>
    <Transition name="locale-menu">
      <div v-if="isOpen" class="locale-menu">
        <button
          v-for="loc in SUPPORTED_LOCALES"
          :key="loc"
          class="locale-option"
          :class="{ active: currentLocale === loc }"
          @click="selectLocale(loc)"
        >
          <span class="locale-name">{{ t(`locale.${loc}`) }}</span>
          <i v-if="currentLocale === loc" class="pi pi-check locale-check"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { setLocale, SUPPORTED_LOCALES } from '@/i18n'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()

const isOpen = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const currentLocale = computed(() => locale.value as 'en' | 'fr')

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function selectLocale(loc: (typeof SUPPORTED_LOCALES)[number]) {
  setLocale(loc)
  isOpen.value = false
  // Replace locale prefix in the current path
  const newPath = route.path.replace(/^\/(en|fr)/, `/${loc}`)
  router.replace({ path: newPath, query: route.query })
}

function onClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.locale-dropdown-wrapper {
  position: relative;
  display: inline-flex;
}

/* Trigger button */
.locale-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  white-space: nowrap;
}

.locale-trigger:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.locale-chevron {
  font-size: 0.65rem;
  transition: transform 0.2s ease;
}

.locale-chevron.open {
  transform: rotate(180deg);
}

/* Dropdown menu */
.locale-menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1010;
  min-width: 10rem;
  padding: 0.25rem 0;
}

.locale-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.65rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s ease;
  text-align: left;
}

.locale-option:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.locale-option.active {
  color: var(--text-primary);
  font-weight: 600;
}

.locale-name {
  flex: 1;
}

.locale-check {
  font-size: 0.75rem;
  color: var(--p-primary-color, #6366f1);
}

/* Transition */
.locale-menu-enter-active,
.locale-menu-leave-active {
  transition: all 0.15s ease;
}

.locale-menu-enter-from,
.locale-menu-leave-to {
  opacity: 0;
  transform: translateY(-0.3rem);
}
</style>
