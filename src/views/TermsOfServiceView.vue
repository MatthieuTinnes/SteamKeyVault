<template>
  <div class="legal-page">
    <div class="legal-container">
      <Card class="legal-card">
        <template #title>
          <div class="legal-header">
            <h1>{{ t('terms.title') }}</h1>
            <p class="legal-meta">{{ t('terms.effectiveDate') }}: <strong>February 28, 2026</strong></p>
          </div>
        </template>
        <template #content>

          <section class="legal-section">
            <h2>1. {{ t('terms.s1.title') }}</h2>
            <p>{{ t('terms.s1.body') }}</p>
            <p class="legal-notice-box">{{ t('terms.s1.disclaimer') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>2. {{ t('terms.s2.title') }}</h2>
            <p>{{ t('terms.s2.body') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>3. {{ t('terms.s3.title') }}</h2>
            <p>{{ t('terms.s3.body') }}</p>
            <ul>
              <li>{{ t('terms.s3.i1') }}</li>
              <li>{{ t('terms.s3.i2') }}</li>
              <li>{{ t('terms.s3.i3') }}</li>
            </ul>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>4. {{ t('terms.s4.title') }}</h2>
            <p>{{ t('terms.s4.body') }}</p>
            <ul>
              <li>{{ t('terms.s4.i1') }}</li>
              <li>{{ t('terms.s4.i2') }}</li>
              <li>{{ t('terms.s4.i3') }}</li>
            </ul>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>5. {{ t('terms.s5.title') }}</h2>
            <p>{{ t('terms.s5.body') }}</p>
            <p class="legal-trademark">{{ t('terms.s5.trademark') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>6. {{ t('terms.s6.title') }}</h2>
            <p>{{ t('terms.s6.body') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>7. {{ t('terms.s7.title') }}</h2>
            <p>{{ t('terms.s7.body') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>8. {{ t('terms.s8.title') }}</h2>
            <p>{{ t('terms.s8.body') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>9. {{ t('terms.s9.title') }}</h2>
            <p>{{ t('terms.s9.body') }}</p>
          </section>

          <div class="legal-back">
            <RouterLink :to="`/${locale}/`">
              <Button :label="t('common.backToHome')" icon="pi pi-arrow-left" text />
            </RouterLink>
            <RouterLink :to="`/${locale}/privacy`">
              <Button :label="t('footer.privacy')" icon="pi pi-shield" text />
            </RouterLink>
          </div>

        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  padding: 2rem 1rem 3rem;
  display: flex;
  justify-content: center;
}

.legal-container {
  width: 100%;
  max-width: 860px;
}

.legal-card {
  width: 100%;
}

.legal-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.legal-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.legal-meta {
  font-size: 0.85rem;
  opacity: 0.65;
  margin: 0;
}

.legal-section {
  margin-bottom: 1rem;
}

.legal-section h2 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--p-primary-color);
}

.legal-section p,
.legal-section li {
  line-height: 1.75;
  font-size: 0.95rem;
}

.legal-section ul {
  padding-left: 1.25rem;
  margin-top: 0.4rem;
}

.legal-section li {
  margin-bottom: 0.25rem;
}

.legal-notice-box {
  background: var(--p-surface-ground);
  border-left: 3px solid var(--p-primary-color);
  padding: 0.75rem 1rem;
  border-radius: 0 6px 6px 0;
  margin-top: 0.5rem;
  font-size: 0.9rem !important;
}

.legal-trademark {
  font-style: italic;
  opacity: 0.8;
  margin-top: 0.4rem;
  font-size: 0.88rem !important;
}

.legal-back {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
</style>
