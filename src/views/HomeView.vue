<template>
  <div class="windmill-landing">
    <div class="windmill-hero">
      <div class="hero-content">
        <h1 class="hero-title">Your Steam Keys, Simplified</h1>
        <p class="hero-subtitle">
          SteamKeyVault is the easiest way to securely store, organize, and trade your Steam keys.
        </p>
        <div class="hero-actions">
          <Button label="Get started" class="p-button-lg p-button-primary" @click="goToMyKeys" />
          <Button label="Learn More" class="p-button-lg p-button-outlined" style="margin-left:1rem;" @click="goToLearnMore" />
        </div>
        <img src="https://windmill.bansal.io/tablet-mockup.png" alt="Product Screenshot on Tablet" class="hero-image" />
      </div>
      <div class="trusted-by">
        <span>Trusted by gamers and traders worldwide</span>
        <div class="brand-logos">
          <img src="https://windmill.bansal.io/logoipsum-288.svg" alt="Brand 1" />
          <img src="https://windmill.bansal.io/logoipsum-317.svg" alt="Brand 2" />
          <img src="https://windmill.bansal.io/logoipsum-321.svg" alt="Brand 3" />
          <img src="https://windmill.bansal.io/logoipsum-323.svg" alt="Brand 4" />
          <img src="https://windmill.bansal.io/logoipsum-330.svg" alt="Brand 5" />
          <img src="https://windmill.bansal.io/logoipsum-331.svg" alt="Brand 6" />
        </div>
      </div>
      <div class="features-section">
        <h2 class="features-title">Why Choose SteamKeyVault?</h2>
        <p class="features-desc">
          Discover the features that make SteamKeyVault the best solution for Steam key collectors, traders, and gamers.
        </p>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
      <div class="discover-section">
        <h2 class="discover-title">Trade, Store, and Access Anywhere</h2>
        <p class="discover-desc">
          With SteamKeyVault, your keys are always at your fingertips. Trade securely, store with confidence, and access your collection from any device.
        </p>
        <div class="discover-features-grid">
          <div class="discover-feature-card" v-for="feature in discoverFeatures" :key="feature.title">
            <h3 class="discover-feature-title">{{ feature.title }}</h3>
            <p class="discover-feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
        <img src="https://windmill.bansal.io/phone-mockup.png" alt="Phone Mockup" class="discover-image" />
      </div>
      <div class="faq-section">
        <h2 class="faq-title">Frequently Asked Questions</h2>
        <div class="faq-list">
          <div class="faq-item" v-for="faq in faqs" :key="faq.q">
            <h3 class="faq-question">{{ faq.q }}</h3>
            <p class="faq-answer">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '../stores/user'
import { logoutUser } from '../api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoggedIn = computed(() => !!userStore.user && !!userStore.user.username)

const features = [
  { title: 'End-to-End Encryption', desc: 'Your Steam keys are encrypted before they leave your device, ensuring only you can access them.' },
  { title: 'Easy Trading', desc: 'Share and trade keys with friends or partners in just a few clicks, with full control and privacy.' },
  { title: 'Access Anywhere', desc: 'Your collection is always available, whether you’re on desktop, tablet, or mobile.' },
  { title: 'Organize & Search', desc: 'Tag, categorize, and search your keys for instant access and better management.' },
  { title: 'One-Click Import', desc: 'Quickly import keys from bundles, emails, or CSV files.' },
  { title: 'Secure Sharing', desc: 'Generate secure, time-limited links to share keys safely.' }
]

const discoverFeatures = [
  { title: 'Trade with Confidence', desc: 'Built-in escrow and audit trail for every trade.' },
  { title: 'Store Securely', desc: 'All keys are protected with industry-leading encryption.' },
  { title: 'Access Anywhere', desc: 'Your vault is always available, on any device.' }
]

const faqs = [
  { q: 'How secure is SteamKeyVault?', a: 'All keys are encrypted end-to-end. Only you have the decryption key, not even we can see your keys.' },
  { q: 'Can I trade keys with others?', a: 'Yes! You can securely trade or share keys with anyone, even if they don’t have a SteamKeyVault account.' },
  { q: 'How do I import my existing keys?', a: 'Use our one-click import tool to add keys from bundles, emails, or CSV files.' },
  { q: 'Is SteamKeyVault free?', a: 'You can get started for free. Premium features are available for power users and traders.' }
]

function goTo(path: string) {
  router.push(path)
}
function isActive(path: string) {
  return route.path === path
}
function goToMyKeys() {
  router.push('/my-keys')
}
function goToLearnMore() {
  router.push('/about')
}
async function handleLogout() {
  await logoutUser()
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

.windmill-landing {
  font-family: 'Inter', Arial, sans-serif;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}
.windmill-hero {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 0 2rem 0;
  background: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-content {
  text-align: center;
  margin-bottom: 2rem;
}
.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.0625rem;
}
.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  max-width: min(32rem, 90vw);
}
.hero-actions {
  margin-bottom: 2rem;
}
.hero-image {
  margin: 2rem auto 0 auto;
  max-width: min(31.25rem, 90vw);
  width: 100%;
  border-radius: 1rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0,0,0,0.08);
}
.trusted-by {
  text-align: center;
  margin: 2rem 0 2rem 0;
  color: var(--text-tertiary);
  font-size: 1rem;
}
.brand-logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}
.brand-logos img {
  height: 2rem;
  opacity: 0.8;
}
.features-section {
  margin-top: 3rem;
  text-align: center;
}
.features-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.features-desc {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13.75rem, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
.feature-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease;
}
.feature-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.feature-desc {
  color: var(--text-secondary);
}
.discover-section {
  margin-top: 4rem;
  text-align: center;
}
.discover-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.discover-desc {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}
.discover-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13.75rem, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
.discover-feature-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease;
}
.discover-feature-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.discover-feature-desc {
  color: var(--text-secondary);
}
.discover-image {
  margin: 3rem auto 0 auto;
  max-width: min(21.875rem, 90vw);
  width: 100%;
  border-radius: 1rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0,0,0,0.08);
}
.faq-section {
  margin-top: 4rem;
  text-align: center;
}
.faq-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.faq-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
.faq-item {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  box-shadow: var(--shadow-sm);
  text-align: left;
  transition: background-color 0.3s ease;
}
.faq-question {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.faq-answer {
  color: var(--text-secondary);
}
</style>
