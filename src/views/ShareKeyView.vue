<template>
  <div class="share-key-view">
    <div class="share-header">
      <h2 v-if="shareInfo">{{ shareInfo.donor_username }} is offering you a key for {{ shareInfo.game_name }}</h2>
      <h2 v-else>Loading the key...</h2>
      <p v-if="shareInfo" class="subtitle">Link valid until {{ formatDateTime(shareInfo.expires_at) }}</p>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="shareInfo" class="share-body">
      <div class="game-card">
        <GameInfo
          v-if="shareInfo.steamapp_id"
          :steamAppId="shareInfo.steamapp_id"
          :gameName="shareInfo.game_name"
          :publicMode="true"
        />
        <div v-else class="custom-game-card">
          <div class="custom-header">
            <h3>{{ shareInfo.game_name }}</h3>
            <span class="custom-tag">Custom Game</span>
          </div>
        </div>
      </div>

      <div class="share-actions">
        <div class="status" v-if="shareInfo.expired">This link has expired.</div>
        <div class="status" v-else-if="shareInfo.revealed">This link has already been used.</div>
        <div class="status" v-else-if="shareInfo.used">This key is already marked as used.</div>

        <div v-if="revealedKey" class="revealed-key">
          <div class="key-label">Revealed key</div>
          <div class="key-row">
            <span class="key-value">{{ revealedKey }}</span>
            <Button icon="pi pi-copy" class="p-button-sm" @click="copyRevealedKey" />
          </div>
        </div>

        <div v-else class="reveal-panel">
          <div class="turnstile" id="turnstile-widget"></div>
          <Button
            label="Reveal key"
            icon="pi pi-unlock"
            :disabled="!canReveal || !turnstileToken"
            :loading="revealing"
            @click="revealKey"
          />
          <small v-if="!turnstileReady" class="hint">Turnstile captcha is not configured.</small>
        </div>

        <div class="message-panel">
          <h3>Send a message to the donor</h3>
          <Textarea v-model="message" rows="4" autoResize placeholder="Write a thank-you message..." />
          <Button
            label="Send message"
            icon="pi pi-send"
            :disabled="!canMessage || !turnstileToken || !message.trim()"
            :loading="sending"
            @click="sendMessage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import GameInfo from '@/components/GameInfo.vue'
import { ensureCSRFToken, TURNSTILE_SITE_KEY } from '@/api/apiHelper'
import { getShareInfo, revealSharedKey, sendShareMessage } from '@/api/keys'

interface ShareInfo {
  token: string
  game_name: string
  steamapp_id?: number | null
  donor_username: string
  expires_at: string
  revealed: boolean
  expired: boolean
  used: boolean
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, any>) => string
      reset: (widgetId: string) => void
    }
  }
}

const route = useRoute()
const toast = useToast()

const shareInfo = ref<ShareInfo | null>(null)
const error = ref('')
const revealedKey = ref('')
const turnstileToken = ref('')
const turnstileWidgetId = ref<string | null>(null)
const turnstileReady = ref(false)
const message = ref('')
const revealing = ref(false)
const sending = ref(false)

const shareToken = computed(() => String(route.params.token || ''))
const canReveal = computed(() => {
  if (!shareInfo.value) return false
  return !shareInfo.value.expired && !shareInfo.value.revealed && !shareInfo.value.used
})
const canMessage = computed(() => {
  if (!shareInfo.value) return false
  return !shareInfo.value.expired
})

const storageKey = computed(() => `shared-key:${shareToken.value}`)

onMounted(async () => {
  await ensureCSRFToken()
  await loadShareInfo()
  const cached = sessionStorage.getItem(storageKey.value)
  if (cached) revealedKey.value = cached
  try {
    await loadTurnstile()
    renderTurnstile()
  } catch (err) {
    turnstileReady.value = false
  }
})

async function loadShareInfo() {
  if (!shareToken.value) {
    error.value = 'Invalid link.'
    return
  }
  try {
    const data = await getShareInfo(shareToken.value)
    shareInfo.value = data
  } catch (err: any) {
    error.value = err?.response?.data?.error || 'Invalid link.'
  }
}

async function loadTurnstile() {
  if (!TURNSTILE_SITE_KEY) {
    turnstileReady.value = false
    return
  }
  if (window.turnstile) {
    turnstileReady.value = true
    return
  }
  await new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('turnstile-script') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile')))
      return
    }
    const script = document.createElement('script')
    script.id = 'turnstile-script'
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(script)
  })
  turnstileReady.value = true
}

function renderTurnstile() {
  if (!turnstileReady.value || !TURNSTILE_SITE_KEY) return
  const container = document.getElementById('turnstile-widget')
  if (!container || !window.turnstile) return
  turnstileWidgetId.value = window.turnstile.render(container, {
    sitekey: TURNSTILE_SITE_KEY,
    callback: (token: string) => {
      turnstileToken.value = token
    },
    'expired-callback': () => {
      turnstileToken.value = ''
    },
    'error-callback': () => {
      turnstileToken.value = ''
    }
  })
}

function resetTurnstile() {
  if (turnstileWidgetId.value && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId.value)
  }
  turnstileToken.value = ''
}

async function revealKey() {
  if (!turnstileToken.value || !shareToken.value) {
    toast.add({ severity: 'warn', summary: 'Captcha', detail: 'Please complete the captcha.', life: 2000 })
    return
  }
  revealing.value = true
  try {
    const data = await revealSharedKey(shareToken.value, turnstileToken.value)
    revealedKey.value = data.key
    sessionStorage.setItem(storageKey.value, data.key)
    await loadShareInfo()
    toast.add({ severity: 'success', summary: 'Key revealed', detail: 'The key is now visible.', life: 2000 })
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.error || 'Unable to reveal the key.', life: 3000 })
  } finally {
    revealing.value = false
    resetTurnstile()
  }
}

async function sendMessage() {
  if (!turnstileToken.value || !shareToken.value) {
    toast.add({ severity: 'warn', summary: 'Captcha', detail: 'Please complete the captcha.', life: 2000 })
    return
  }
  if (!message.value.trim()) return
  sending.value = true
  try {
    await sendShareMessage(shareToken.value, turnstileToken.value, message.value.trim())
    message.value = ''
    toast.add({ severity: 'success', summary: 'Sent', detail: 'Message sent to the donor.', life: 2000 })
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.error || 'Unable to send the message.', life: 3000 })
  } finally {
    sending.value = false
    resetTurnstile()
  }
}

async function copyRevealedKey() {
  try {
    await navigator.clipboard.writeText(revealedKey.value)
    toast.add({ severity: 'success', summary: 'Copied', detail: 'Key copied.', life: 2000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Unable to copy the key.', life: 2000 })
  }
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.share-key-view {
  max-width: 72rem;
  margin: 2rem auto 4rem;
  padding: 0 1.5rem;
}

.share-header {
  margin-bottom: 1.5rem;
}

.share-header h2 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-secondary);
}

.error {
  padding: 1rem;
  border-radius: 0.5rem;
  background: #fee2e2;
  color: #991b1b;
  margin-bottom: 1rem;
}

.share-body {
  display: grid;
  grid-template-columns: minmax(18rem, 32rem) minmax(18rem, 1fr);
  gap: 1.5rem;
}

.game-card {
  position: sticky;
  top: 6rem;
  align-self: start;
}

.custom-game-card {
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.custom-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.custom-tag {
  font-size: 0.85rem;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
}

.share-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.reveal-panel,
.message-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.revealed-key {
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.key-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.key-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.key-value {
  font-family: monospace;
  font-size: 1rem;
  color: var(--text-primary);
}

.hint {
  color: var(--text-secondary);
}

@media (max-width: 64rem) {
  .share-body {
    grid-template-columns: 1fr;
  }

  .game-card {
    position: static;
  }
}
</style>
