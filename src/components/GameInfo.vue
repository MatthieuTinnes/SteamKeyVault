<template>
    <div class="game-info" :class="{ 'has-background': !!backgroundImage }" :style="backgroundStyle">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="appName" class="content">
            <div class="header">
                <img v-if="headerImage" :src="headerImage" :alt="appName" class="header-image" />
                <div class="title-section">
                    <h2 class="title">{{ appName }}</h2>
                    <div class="publisher" v-if="publisher">by {{ publisher }}</div>
                </div>
              <div style="display:flex;align-items:flex-start;gap:0.5rem">
              <Button class="p-button-sm p-button-danger" @click="handleOpenDelete"><i
              class="pi pi-trash"></i></Button>
              </div>
            </div>
            <div class="details">
                <div class="price-reviews">
                    <div class="price" v-if="price">{{ price }}</div>
                    <div class="reviews" v-if="reviews">
                        <span :class="['review-score', getReviewClass(reviews)]">
                            Metascore {{ reviews }}
                        </span>
                    </div>
                </div>
                <div class="links-features">
                    <div class="game-features" v-if="hasCards || hasAchievements">
                        <a v-if="hasCards && steamCardsUrl" 
                           :href="steamCardsUrl" 
                           target="_blank" 
                           rel="noopener" 
                           class="feature-badge clickable" 
                           title="View Trading Cards on Steam Market">
                            <i class="pi pi-credit-card"></i>
                        </a>
            <a v-if="hasAchievements && steamAchievementsUrl" :href="steamAchievementsUrl" target="_blank" rel="noopener" class="feature-badge clickable" title="View Achievements on Steam">
              <i class="pi pi-star"></i>
            </a>
                    </div>
                    <div class="external-links">
                        <a v-if="steamStoreUrl" :href="steamStoreUrl" target="_blank" rel="noopener" class="steam-link" title="View on Steam Store">
                            <i class="pi pi-external-link"></i> Steam
                        </a>
                        <a v-if="steamDbUrl" :href="steamDbUrl" target="_blank" rel="noopener" class="steamdb-link" title="View on SteamDB">
                            <i class="pi pi-chart-line"></i> SteamDB
                        </a>
                        <button v-if="asfCommand" @click="copyAsfCommand" class="asf-button" title="Copy ASF Command">
                            <i class="pi pi-copy"></i> ASF
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="no-data">
            <h1>{{ steamAppId }}</h1>
        </div>
        <DeleteGameModal :modelValue="showDeleteModal" :hasKeys="hasKeys" @update:modelValue="onModalUpdate" @confirmed="handleConfirmDelete" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getSteamAppDetails } from '@/api/games'
import DeleteGameModal from './DeleteGameModal.vue'
import Button from 'primevue/button'
import { useDeleteGame } from '@/composables/useDeleteGame'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{ steamAppId: number | null; userGameId?: number | null }>()
const emit = defineEmits<{
  (e: 'deleted'): void
}>()

const appName = ref<string | null>(null)
const price = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const publisher = ref<string | null>(null)
const headerImage = ref<string | null>(null)
const backgroundImage = ref<string | null>(null)
const reviews = ref<number | null>(null)
const hasCards = ref<boolean>(false)
const hasAchievements = ref<boolean>(false)
const { showDeleteModal, hasKeys, openDelete, confirmDelete, onModalUpdate } = useDeleteGame()
const toast = useToast()

const steamStoreUrl = computed(() => 
  props.steamAppId ? `https://store.steampowered.com/app/${props.steamAppId}` : null
)

const steamDbUrl = computed(() =>
  props.steamAppId ? `https://steamdb.info/app/${props.steamAppId}/` : null
)

const steamCardsUrl = computed(() =>
  props.steamAppId ? `https://steamcommunity.com/market/search?sort_column=name&sort_dir=asc&category_753_Game%5B0%5D=tag_app_${props.steamAppId}&category_753_cardborder%5B0%5D=tag_cardborder_0&category_753_item_class%5B0%5D=tag_item_class_2` : null
)

const asfCommand = computed(() =>
  props.steamAppId ? `!addlicense asf s/${props.steamAppId}` : null
)

async function copyAsfCommand() {
  if (asfCommand.value) {
    try {
      await navigator.clipboard.writeText(asfCommand.value)
      toast.add({
        severity: 'success',
        summary: 'Command Copied',
        detail: 'ASF command has been copied to clipboard',
        life: 3000
      })
    } catch (err) {
      console.error('Failed to copy ASF command:', err)
      toast.add({
        severity: 'error',
        summary: 'Copy Failed',
        detail: 'Failed to copy command to clipboard',
        life: 3000
      })
    }
  }
}

const steamAchievementsUrl = computed(() =>
  props.steamAppId ? `https://steamcommunity.com/stats/${props.steamAppId}/achievements` : null
)

const backgroundStyle = computed(() => ({
  backgroundImage: backgroundImage.value ? `url(${backgroundImage.value})` : 'none'
}))

function getReviewClass(score: number): string {
  if (score >= 80) return 'very-positive'
  if (score >= 70) return 'positive'
  if (score >= 40) return 'mixed'
  return 'negative'
}

async function loadApp(appid: number) {
  loading.value = true
  error.value = null
  appName.value = null
  price.value = null
  publisher.value = null
  headerImage.value = null
  backgroundImage.value = null
  reviews.value = null
  try {
    const lang = navigator.language ? navigator.language.split('-')[0] : undefined
    const data = await getSteamAppDetails(appid, lang)
    
    appName.value = data?.name ?? null
    publisher.value = data?.publishers?.[0] ?? null
    headerImage.value = data?.header_image ?? null
    backgroundImage.value = data?.background ?? null

    // Handle price
    const priceOverview = data?.price_overview ?? null
    if (priceOverview && typeof priceOverview.final === 'number') {
      const currency = priceOverview.currency || 'USD'
      price.value = (priceOverview.final / 100).toLocaleString(undefined, { style: 'currency', currency })
    } else {
      price.value = data?.is_free ? 'Free to Play' : null
    }
    reviews.value = data?.metacritic?.score

    // Check for trading cards and achievements
    hasCards.value = data?.categories?.some((cat: any) => cat.id === 29) ?? false
    hasAchievements.value = data?.categories?.some((cat: any) => cat.id === 22) ?? false
    // try to resolve userGameId from a list in parent is easier, but we can leave null
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
    publisher.value = null
    headerImage.value = null
    backgroundImage.value = null
    reviews.value = null
    hasCards.value = false
    hasAchievements.value = false
  }
}, { immediate: true })

// wire composable actions to emit when deletion succeeded
async function handleConfirmDelete() {
  const success = await confirmDelete(props.userGameId ?? null)
  if (success) emit('deleted')
}

function handleOpenDelete() {
  void openDelete(props.userGameId ?? null)
}
</script>

<style scoped>
.game-info {
  padding: 1.5rem;
  color: white;
  border-radius: 8px;
  min-height: 200px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background-color: #1b2838;
}

.game-info.has-background::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background-image: inherit;
  background-size: cover;
  background-position: center;
  filter: blur(15px);
  opacity: 0.2;
  z-index: 0;
}

.game-info > * {
  position: relative;
  z-index: 1;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.header-image {
  width: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.title-section {
  flex: 1;
}

.title {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: white;
}

.publisher {
  color: #ccc;
  font-size: 0.9rem;
}

.details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.price-reviews {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
}

.reviews {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-score {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.review-count {
  color: #ccc;
  font-size: 0.9rem;
}

.very-positive { background-color: #66c0f4; color: white; }
.positive { background-color: #66c0f4; color: white; }
.mixed { background-color: #b9a074; color: white; }
.negative { background-color: #c94a4a; color: white; }

.steam-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
}

.steam-link:hover, .steamdb-link:hover, .asf-button:hover {
  background-color: rgba(255,255,255,0.2);
}

.asf-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
  color: white;
  border: none;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
}

.asf-button:active {
  transform: translateY(1px);
  background-color: rgba(255,255,255,0.3);
}

.steamdb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  margin-left: 0.5rem;
}

.links-features {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.game-features {
  display: flex;
  gap: 0.5rem;
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #66c0f4;
  transition: all 0.2s ease;
  text-decoration: none;
}

.feature-badge.clickable {
  cursor: pointer;
}

.feature-badge.clickable:hover {
  background-color: rgba(102, 192, 244, 0.2);
  transform: translateY(-1px);
  color: white;
}

.feature-badge:hover {
  background-color: rgba(255,255,255,0.2);
  transform: translateY(-1px);
}

.loading {
  color: white;
  text-align: center;
  padding: 2rem;
}

.error {
  color: #ff4444;
  background: rgba(255,0,0,0.1);
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.no-data {
  color: #ccc;
  text-align: center;
  padding: 2rem;
}
</style>