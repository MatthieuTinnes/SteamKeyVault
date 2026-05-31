<template>
  <div class="home-view">

    <!-- ============================
         HERO
         ============================ -->
    <section class="hero-section">
      <div class="hero-inner">
        <div class="hero-content">
          <span class="hero-eyebrow">{{ t('home.eyebrow') }}</span>
          <h1 class="hero-title">{{ t('home.heroTitle') }}</h1>
          <p class="hero-subtitle">{{ t('home.heroSubtitle') }}</p>
          <div class="hero-actions">
            <Button
              :label="t('home.getStarted')"
              class="p-button-lg hero-btn-primary"
              icon="pi pi-key"
              @click="goToMyKeys"
            />
            <Button
              :label="t('home.viewDocs')"
              class="p-button-lg"
              severity="secondary"
              outlined
              icon="pi pi-book"
              @click="goToDocs"
            />
          </div>
        </div>

        <!-- App preview mockup -->
        <div class="hero-preview">
          <img
            :src="mockupSrc"
            :alt="t('home.heroTitle')"
            class="mockup-img"
          />
          <div class="preview-glow"></div>
        </div>
      </div> 
    </section>

    <!-- ============================
         TRUST STRIP
         ============================ -->
    <section class="trust-strip">
      <div class="trust-inner">
        <div class="trust-item" v-for="item in trustItems" :key="item.icon">
          <i :class="['pi', item.icon]"></i>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </section>

    <!-- ============================
         FEATURES
         ============================ -->
    <section class="features-section">
      <div class="section-inner">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.featuresTitle') }}</h2>
          <p class="section-desc">{{ t('home.featuresDesc') }}</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <div class="feature-icon-wrap">
              <i :class="['pi', feature.icon]"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         HOW IT WORKS
         ============================ -->
    <section class="howitworks-section">
      <div class="section-inner">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.howItWorksTitle') }}</h2>
          <p class="section-desc">{{ t('home.howItWorksDesc') }}</p>
        </div>
        <div class="steps-grid">
          <div class="step-card" v-for="(step, index) in steps" :key="step.number">
            <div class="step-connector" v-if="index < steps.length - 1" aria-hidden="true"></div>
            <div class="step-number">{{ step.number }}</div>
            <div class="step-icon-wrap">
              <i :class="['pi', step.icon]"></i>
            </div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         SECURITY SPOTLIGHT
         ============================ -->
    <section class="security-section">
      <div class="security-inner">
        <div class="security-text">
          <div class="security-eyebrow">
            <i class="pi pi-shield"></i>
            <span>{{ t('home.securityEyebrow') }}</span>
          </div>
          <h2 class="security-title">{{ t('home.securityTitle') }}</h2>
          <p class="security-desc">{{ t('home.securityDesc') }}</p>
          <ul class="security-points">
            <li v-for="point in securityPoints" :key="point">
              <i class="pi pi-check-circle"></i>
              <span>{{ point }}</span>
            </li>
          </ul>
        </div>
        <div class="security-visual" aria-hidden="true">
          <div class="security-card">
            <div class="security-card-icon">
              <i class="pi pi-lock"></i>
            </div>
             <div class="security-card-label">{{ t('home.securityCard.label') }}</div>
            <div class="security-card-flow">
              <div class="flow-step">
                <div class="flow-node">
                  <i class="pi pi-user"></i>
                </div>
                 <div class="flow-label">{{ t('home.securityCard.browser') }}</div>
              </div>
              <div class="flow-arrow">
                <div class="flow-arrow-line"></div>
                <div class="flow-arrow-badge">
                  <i class="pi pi-lock"></i>
                   {{ t('home.securityCard.aes') }}
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-node flow-node-server">
                  <i class="pi pi-database"></i>
                </div>
                 <div class="flow-label">{{ t('home.securityCard.server') }}</div>
              </div>
            </div>
           <div class="security-card-note">
             <i class="pi pi-info-circle"></i>
             {{ t('home.securityCard.note') }}
           </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         FAQ
         ============================ -->
    <section class="faq-section">
      <div class="section-inner">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.faqTitle') }}</h2>
        </div>
        <div class="faq-list">
          <div
            class="faq-item"
            v-for="(faq, index) in faqs"
            :key="faq.q"
            :class="{ 'faq-open': openFaq === index }"
            @click="toggleFaq(index)"
          >
            <div class="faq-header">
              <h3 class="faq-question">{{ faq.q }}</h3>
              <i class="pi faq-chevron" :class="openFaq === index ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
            </div>
            <div class="faq-body" v-show="openFaq === index">
              <p class="faq-answer">{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         BOTTOM CTA
         ============================ -->
    <section class="cta-section">
      <div class="cta-inner">
        <h2 class="cta-title">{{ t('home.ctaTitle') }}</h2>
        <p class="cta-desc">{{ t('home.ctaDesc') }}</p>
        <Button
          :label="t('home.ctaButton')"
          class="p-button-lg cta-btn"
          icon="pi pi-key"
          @click="goToRegister"
        />
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'

import mockupEnDark from '@/assets/mockup/mykeys_en_dark.avif'
import mockupEnLight from '@/assets/mockup/mykeys_en_light.avif'
import mockupFrDark from '@/assets/mockup/mykeys_fr_dark.avif'
import mockupFrLight from '@/assets/mockup/mykeys_fr_light.avif'

const router = useRouter()
const { t, tm, locale } = useI18n()
const { currentTheme } = useTheme()

const mockupSrc = computed(() => {
  const lang = locale.value.startsWith('fr') ? 'fr' : 'en'
  const theme = currentTheme.value
  const map: Record<string, string> = {
    fr_dark: mockupFrDark,
    fr_light: mockupFrLight,
    en_dark: mockupEnDark,
    en_light: mockupEnLight,
  }
  return map[`${lang}_${theme}`]
})

const features = computed(() => tm('home.features') as { icon: string; title: string; desc: string }[])
const trustItems = computed(() => tm('home.trustItems') as { icon: string; label: string }[])
const steps = computed(() => tm('home.steps') as { number: string; icon: string; title: string; desc: string }[])
const securityPoints = computed(() => tm('home.securityPoints') as string[])
const faqs = computed(() => tm('home.faqs') as { q: string; a: string }[])

const openFaq = ref<number | null>(null)

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index
}

function goToMyKeys() {
  router.push(`/${locale.value}/my-keys`)
}
function goToDocs() {
  router.push(`/${locale.value}/documentation`)
}
function goToRegister() {
  router.push(`/${locale.value}/register`)
}
</script>

<style scoped>
/* ===========================
   Layout base
   =========================== */
.home-view {
  width: 100%;
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.section-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 5rem 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.section-desc {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 38rem;
  margin: 0 auto;
  line-height: 1.6;
}

/* ===========================
   HERO
   =========================== */
.hero-section {
  background: var(--bg-secondary);
  padding: 4rem 2rem 0;
  overflow: hidden;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  padding-bottom: 4rem;
}

.hero-eyebrow {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  padding: 0.35rem 0.85rem;
  border-radius: 99px;
  margin-bottom: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--primary-color) 25%, transparent);
}

.hero-title {
  font-size: 3.25rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin-bottom: 2.5rem;
  max-width: 32rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-btn-primary {
  box-shadow: 0 4px 14px 0 color-mix(in srgb, var(--primary-color) 40%, transparent);
}

/* App preview mockup */
.hero-preview {
  position: relative;
  padding-bottom: 1rem;
}

.mockup-img {
  position: relative;
  z-index: 1;
  width: 150%;
  height: auto;
  border-radius: 0.875rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--border-color);
  display: block;
  transition: opacity 0.3s ease;
}

.preview-glow {
  position: absolute;
  inset: 10% -10%;
  background: radial-gradient(ellipse at center, color-mix(in srgb, var(--primary-color) 20%, transparent) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  filter: blur(30px);
}

/* ===========================
   TRUST STRIP
   =========================== */
.trust-strip {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.trust-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.25rem 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem 2.5rem;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.trust-item .pi {
  color: var(--primary-color);
  font-size: 1rem;
}

/* ===========================
   FEATURES
   =========================== */
.features-section {
  background: var(--bg-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 2rem 1.75rem;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: color-mix(in srgb, var(--primary-color) 30%, var(--border-color));
}

.feature-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.feature-icon-wrap .pi {
  font-size: 1.2rem;
  color: var(--primary-color);
}

.feature-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.6rem;
}

.feature-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

/* ===========================
   HOW IT WORKS
   =========================== */
.howitworks-section {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  position: relative;
}

.step-card {
  position: relative;
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
}

.step-connector {
  position: absolute;
  top: 3.5rem;
  right: -1.25rem;
  width: 2.5rem;
  height: 2px;
  background: linear-gradient(to right, var(--border-color), var(--primary-color));
  z-index: 1;
}

.step-number {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.step-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  border: 2px solid color-mix(in srgb, var(--primary-color) 25%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}

.step-icon-wrap .pi {
  font-size: 1.35rem;
  color: var(--primary-color);
}

.step-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.6rem;
}

.step-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

/* ===========================
   SECURITY SECTION
   =========================== */
.security-section {
  background: var(--bg-secondary);
}

.security-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 5rem 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}

.security-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary-color);
  margin-bottom: 1.25rem;
}

.security-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.security-desc {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin-bottom: 2rem;
}

.security-points {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.security-points li {
  display: flex;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.security-points li .pi {
  color: #22c55e;
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

/* Security visual */
.security-visual {
  display: flex;
  justify-content: center;
}

.security-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 2rem 2rem 1.5rem;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 340px;
}

.security-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.security-card-icon .pi {
  font-size: 1.6rem;
  color: var(--primary-color);
}

.security-card-label {
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 1.75rem;
}

.security-card-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.flow-node {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.flow-node-server {
  background: color-mix(in srgb, var(--primary-color) 10%, var(--bg-tertiary));
  border-color: color-mix(in srgb, var(--primary-color) 25%, var(--border-color));
  color: var(--primary-color);
}

.flow-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.flow-arrow {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.flow-arrow-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, var(--border-color), var(--primary-color), var(--border-color));
}

.flow-arrow-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  white-space: nowrap;
}

.security-card-note {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  padding: 0.6rem 0.75rem;
}

.security-card-note .pi {
  flex-shrink: 0;
  margin-top: 0.05rem;
}

/* ===========================
   FAQ
   =========================== */
.faq-section {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

.faq-list {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.faq-item:hover,
.faq-item.faq-open {
  border-color: color-mix(in srgb, var(--primary-color) 35%, var(--border-color));
}

.faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem;
}

.faq-question {
  font-size: 0.975rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.faq-chevron {
  color: var(--text-tertiary);
  flex-shrink: 0;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.faq-open .faq-chevron {
  color: var(--primary-color);
}

.faq-body {
  padding: 0 1.5rem 1.25rem;
}

.faq-answer {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
}

/* ===========================
   BOTTOM CTA
   =========================== */
.cta-section {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.cta-inner {
  max-width: 680px;
  margin: 0 auto;
  padding: 5rem 2rem;
  text-align: center;
}

.cta-title {
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.cta-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.cta-btn {
  box-shadow: 0 4px 14px 0 color-mix(in srgb, var(--primary-color) 40%, transparent);
}

/* ===========================
   RESPONSIVE
   =========================== */
@media (max-width: 1024px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .hero-preview {
    max-width: 560px;
    margin: 0 auto;
    width: 100%;
  }

  .hero-content {
    padding-bottom: 0;
    text-align: center;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .security-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .security-visual {
    order: -1;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem 0;
  }

  .hero-title {
    font-size: 2.25rem;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .step-connector {
    display: none;
  }

  .flow-arrow-badge {
    font-size: 0.75rem;
  }

  .flow-label {
    font-size: 0.8rem;
  }

  .security-card-note {
    font-size: 0.8rem;
  }

  .step-number {
    font-size: 0.8rem;
  }

  .section-inner {
    padding: 3.5rem 1rem;
  }

  .security-inner {
    padding: 3.5rem 1rem;
  }

  .trust-inner {
    gap: 0.65rem 1.5rem;
  }

  .cta-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
