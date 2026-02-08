<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ t('home.heroTitle') }}</h1>
        <p class="hero-subtitle">
          {{ t('home.heroSubtitle') }}
        </p>
        <div class="hero-actions">
          <Button :label="t('home.getStarted')" class="p-button-lg" @click="goToMyKeys" />
          <Button :label="t('home.learnMore')" class="p-button-lg" severity="secondary" outlined style="margin-left: 1rem;" @click="goToLearnMore" />
        </div>
      </div>
      <div class="features-section">
        <h2 class="features-title">{{ t('home.featuresTitle') }}</h2>
        <p class="features-desc">
          {{ t('home.featuresDesc') }}
        </p>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
      <div class="discover-section">
        <h2 class="discover-title">{{ t('home.discoverTitle') }}</h2>
        <p class="discover-desc">
          {{ t('home.discoverDesc') }}
        </p>
        <div class="discover-features-grid">
          <div class="discover-feature-card" v-for="feature in discoverFeatures" :key="feature.title">
            <h3 class="discover-feature-title">{{ feature.title }}</h3>
            <p class="discover-feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
      <div class="faq-section">
        <h2 class="faq-title">{{ t('home.faqTitle') }}</h2>
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
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoggedIn = computed(() => !!userStore.user && !!userStore.user.username)
const { t, tm } = useI18n()

const features = computed(() => tm('home.features') as { title: string; desc: string }[])
const discoverFeatures = computed(() => tm('home.discoverFeatures') as { title: string; desc: string }[])
const faqs = computed(() => tm('home.faqs') as { q: string; a: string }[])

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
.home-view {
  width: 100%;
  min-height: calc(100vh - 5rem);
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 2rem;
}

.hero-section {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-content {
  text-align: center;
  margin-bottom: 4rem;
  padding-top: 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  letter-spacing: -0.05em;
  color: var(--text-primary);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-image {
  max-width: 100%;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.trusted-by {
  text-align: center;
  margin: 4rem 0;
  color: var(--text-tertiary);
}

.brand-logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  opacity: 0.7;
}

.brand-logos img {
  height: 2rem;
  filter: grayscale(100%);
  transition: filter 0.3s;
}

.brand-logos img:hover {
  filter: grayscale(0%);
}

.features-section, .discover-section, .faq-section {
  margin-top: 6rem;
  text-align: center;
  width: 100%;
}

.features-title, .discover-title, .faq-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.features-desc, .discover-desc {
  color: var(--text-secondary);
  margin-bottom: 3rem;
  font-size: 1.125rem;
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
}

.features-grid, .discover-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  text-align: left;
}

.feature-card, .discover-feature-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover, .discover-feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.feature-title, .discover-feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.feature-desc, .discover-feature-desc {
  color: var(--text-secondary);
  line-height: 1.6;
}

.discover-image {
  margin-top: 4rem;
  max-width: 100%;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.faq-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  text-align: left;
}

.faq-item {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.faq-question {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.faq-answer {
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.25rem;
  }
  
  .features-grid, .discover-features-grid, .faq-list {
    grid-template-columns: 1fr;
  }
  
  .home-view {
    padding: 1rem;
  }
}
</style>
