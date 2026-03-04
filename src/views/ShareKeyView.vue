<template>
  <div class="share-key-view">
    <div class="share-header">
      <h2 v-if="shareInfo">{{ t('share.offerTitle', { donor: shareInfo.donor_username, game: shareInfo.game_name }) }}</h2>
      <h2 v-else>{{ t('share.loadingKey') }}</h2>
      <p v-if="shareInfo" class="subtitle">{{ t('share.validUntil', { date: formatDateTime(shareInfo.expires_at) }) }}</p>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="shareInfo" class="share-body">
      <div class="game-card">
        <GameInfo
          v-if="shareInfo.steamapp_id"
          :steamAppId="shareInfo.steamapp_id"
          :gameName="shareInfo.game_name"
          :publicMode="true"
          :publicData="publicGameInfo"
        />
        <div v-else class="custom-game-card">
          <div class="custom-header">
            <h3>{{ shareInfo.game_name }}</h3>
          </div>
        </div>
      </div>

      <div class="share-actions">
        <div class="status" v-if="shareInfo.expired">{{ t('share.expired') }}</div>
        <div class="status" v-else-if="shareInfo.revealed">{{ t('share.revealed') }}</div>
        <div class="status" v-else-if="shareInfo.used">{{ t('share.used') }}</div>

        <div class="promo-card">
          <div class="promo-text">
            {{ t('share.promo') }}
          </div>
          <Button :label="t('share.createAccount')" class="p-button-sm p-button-primary" @click="goToRegister" />
        </div>

        <div v-if="revealedKey" class="revealed-key">
          <div class="key-label">{{ t('share.revealedKey') }}</div>
          <div class="key-row">
            <span class="key-value">{{ revealedKey }}</span>
            <div class="key-actions">
              <Button icon="pi pi-copy" class="p-button-sm" @click="copyRevealedKey" />
              <a
                v-if="revealedKey"
                :href="`https://store.steampowered.com/account/registerkey?key=${encodeURIComponent(revealedKey)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="p-button p-button-sm p-button-success"
                style="margin-left:0.5rem"
              >
                <i class="pi pi-external-link"></i>
                <span style="margin-left:0.5rem">{{ t('share.activateSteam') }}</span>
              </a>
            </div>
          </div>
        </div>

        <div v-else-if="!shareInfo.used" class="reveal-panel">
          <div class="turnstile" id="turnstile-reveal"></div>
          <Button
            :label="t('share.revealKey')"
            icon="pi pi-unlock"
            :disabled="!canReveal || !revealToken"
            :loading="revealing"
            @click="revealKey"
          />
          <small v-if="!turnstileReady" class="hint">{{ t('share.captchaMissing') }}</small>
        </div>

        <div v-if="!shareInfo.message_sent && (!shareInfo.used || shareInfo.revealed)" class="message-panel">
          <h3>{{ t('share.sendMessageTitle') }}</h3>
          <Textarea v-model="message" rows="4" autoResize :placeholder="t('share.messagePlaceholder')" maxlength="100" />
          <small class="hint">{{ message.trim().length }}/100</small>
          <div class="turnstile" id="turnstile-message"></div>
          <Button
            :label="t('share.sendMessage')"
            icon="pi pi-send"
            :disabled="!canMessage || !message.trim() || message.trim().length > 100 || !messageToken"
            :loading="sending"
            @click="sendMessage"
          />
          <small v-if="!turnstileReady" class="hint">{{ t('share.captchaMissing') }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import GameInfo from '@/components/GameInfo.vue'
import { ensureCSRFToken, TURNSTILE_SITE_KEY } from '@/api/apiHelper'
import { getShareInfo, revealSharedKey, sendShareMessage } from '@/api/keys'
import { useI18n } from 'vue-i18n'

interface ShareInfo {
  token: string
  game_name: string
  steamapp_id?: number | null
  publisher?: string | null
  header_image?: string | null
  background_image?: string | null
  donor_username: string
  expires_at: string
  revealed: boolean
  expired: boolean
  used: boolean
  message_sent?: boolean
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
const router = useRouter()

const shareInfo = ref<ShareInfo | null>(null)
const error = ref('')
const revealedKey = ref('')
const revealToken = ref('')
const revealWidgetId = ref<string | null>(null)
const messageToken = ref('')
const messageWidgetId = ref<string | null>(null)
const turnstileReady = ref(false)
const message = ref('')
const revealing = ref(false)
const sending = ref(false)
const { t } = useI18n()

const shareToken = computed(() => String(route.params.token || ''))
const canReveal = computed(() => {
  if (!shareInfo.value) return false
  return !shareInfo.value.expired && !shareInfo.value.revealed && !shareInfo.value.used
})
const canMessage = computed(() => {
  if (!shareInfo.value) return false
  return !shareInfo.value.expired && !shareInfo.value.message_sent
})

const publicGameInfo = computed(() => {
  if (!shareInfo.value) return null
  return {
    name: shareInfo.value.game_name,
    publisher: shareInfo.value.publisher ?? null,
    header_image: shareInfo.value.header_image ?? null,
    background_image: shareInfo.value.background_image ?? null
  }
})

function goToRegister() {
  router.push('/register')
}

const storageKey = computed(() => `shared-key:${shareToken.value}`)


// Turnstile is loaded once on mount after share info is fetched.

onMounted(async () => {
  await ensureCSRFToken()
  await loadShareInfo()
  const cached = sessionStorage.getItem(storageKey.value)
  if (cached) revealedKey.value = cached
  if (shareInfo.value) {
    await nextTick()
    try {
      await loadTurnstile()
      renderTurnstile()
    } catch (err) {
      console.error('Turnstile load error:', err)
      turnstileReady.value = false
    }
  }
})

async function loadShareInfo() {
  if (!shareToken.value) {
    error.value = t('share.invalidLink')
    return
  }
  try {
    const data = await getShareInfo(shareToken.value)
    shareInfo.value = data
  } catch (err: any) {
    error.value = err?.response?.data?.error || t('share.invalidLink')
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
  if (!turnstileReady.value || !TURNSTILE_SITE_KEY || !window.turnstile) return

  const revealEl = document.getElementById('turnstile-reveal')
  if (revealEl && !revealWidgetId.value) {
    revealWidgetId.value = window.turnstile.render(revealEl, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => { revealToken.value = token },
      'expired-callback': () => { revealToken.value = '' },
      'error-callback': () => { revealToken.value = '' },
      action: 'share_key_reveal'
    })
  }

  const messageEl = document.getElementById('turnstile-message')
  if (messageEl && !messageWidgetId.value) {
    messageWidgetId.value = window.turnstile.render(messageEl, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => { messageToken.value = token },
      'expired-callback': () => { messageToken.value = '' },
      'error-callback': () => { messageToken.value = '' },
      action: 'share_key_message'
    })
  }
}

function resetTurnstile(widget: 'reveal' | 'message' = 'reveal') {
  if (!window.turnstile) return

  if (widget === 'reveal' && revealWidgetId.value) {
    window.turnstile.reset(revealWidgetId.value)
    revealToken.value = ''
  } else if (widget === 'message' && messageWidgetId.value) {
    window.turnstile.reset(messageWidgetId.value)
    messageToken.value = ''
  }
}

async function revealKey() {
  if (!revealToken.value || !shareToken.value) {
    toast.add({ severity: 'warn', summary: t('share.captcha'), detail: t('share.captchaRequired'), life: 2000 })
    return
  }
  revealing.value = true
  try {
    const data = await revealSharedKey(shareToken.value, revealToken.value)
    revealedKey.value = data.key
    sessionStorage.setItem(storageKey.value, data.key)
    await loadShareInfo()
    toast.add({ severity: 'success', summary: t('share.keyRevealed'), detail: t('share.keyRevealedDetail'), life: 2000 })
  } catch (err: any) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: err?.response?.data?.error || t('share.revealFailed'), life: 3000 })
  } finally {
    revealing.value = false
    resetTurnstile('reveal')
  }
}

async function sendMessage() {
  if (!shareToken.value) {
    toast.add({ severity: 'warn', summary: t('common.error'), detail: t('share.invalidLink'), life: 2000 })
    return
  }
  const text = message.value.trim()
  if (!text) return
  if (text.length > 100) {
    toast.add({ severity: 'warn', summary: t('common.error'), detail: t('share.messageTooLong'), life: 3000 })
    return
  }
  if (!messageToken.value) {
    toast.add({ severity: 'warn', summary: t('share.captcha'), detail: t('share.captchaRequired'), life: 2000 })
    return
  }
  sending.value = true
  try {
    await sendShareMessage(shareToken.value, messageToken.value, message.value.trim())
    message.value = ''
    await loadShareInfo()
    toast.add({ severity: 'success', summary: t('share.sent'), detail: t('share.messageSent'), life: 2000 })
  } catch (err: any) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: err?.response?.data?.error || t('share.sendFailed'), life: 3000 })
  } finally {
    sending.value = false
    resetTurnstile('message')
  }
}

async function copyRevealedKey() {
  try {
    await navigator.clipboard.writeText(revealedKey.value)
    toast.add({ severity: 'success', summary: t('share.copied'), detail: t('share.copiedDetail'), life: 2000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('share.copyFailed'), life: 2000 })
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
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-start;
}

.game-card {
  flex: 1 1 24rem;
  width: 100%;
  position: sticky;
  top: 6rem;
}

.share-actions {
  flex: 1 1 20rem;
  width: 100%;
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

.promo-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, rgba(14,165,233,0.06), rgba(99,102,241,0.04));
  border: 1px solid rgba(99,102,241,0.08);
}
.promo-text {
  color: var(--text-primary);
  font-size: 0.95rem;
}

@media (max-width: 64rem) {
  .game-card {
    position: static;
  }
}
</style>
