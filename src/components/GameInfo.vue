<template>
    <div class="game-info">
        <div v-if="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="appName">
            <h2 class="title">{{ appName }}</h2>
            <div class="price" v-if="price">Price: {{ price }}</div>
        </div>
        <div v-else>
            <h1>{{ steamAppId }}</h1>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getSteamAppDetails } from '@/api/games'

const props = defineProps<{ steamAppId: number | null }>()

const appName = ref<string | null>(null)
const price = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function loadApp(appid: number) {
  loading.value = true
  error.value = null
  appName.value = null
  price.value = null
  try {
    const lang = navigator.language ? navigator.language.split('-')[0] : undefined
    const data = await getSteamAppDetails(appid, lang)
    // backend returns Steam 'data' object; be defensive when accessing fields
    appName.value = data?.name ?? null
    const priceOverview = data?.price_overview ?? null
    if (priceOverview && typeof priceOverview.final === 'number') {
      const currency = priceOverview.currency || 'USD'
      price.value = (priceOverview.final / 100).toLocaleString(undefined, { style: 'currency', currency })
    } else {
      price.value = null
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

watch(() => props.steamAppId, (id) => {
  if (id) loadApp(id)
  else {
    appName.value = null
    price.value = null
    error.value = null
  }
}, { immediate: true })
</script>

<style scoped>
.game-info { padding: 1rem; }
.title { margin: 0 0 0.5rem 0 }
.price { margin-top: 0.5rem; font-weight:600 }
.error { color: #c00 }
</style>