<template>
  <div class="legal-page">
    <div class="legal-container">
      <Card class="legal-card">
        <template #title>
          <div class="legal-header">
            <h1>{{ t('privacy.title') }}</h1>
            <p class="legal-meta">{{ t('privacy.effectiveDate') }}: <strong>February 28, 2026</strong></p>
          </div>
        </template>
        <template #content>

          <section class="legal-section">
            <h2>1. {{ t('privacy.s1.title') }}</h2>
            <p>{{ t('privacy.s1.body') }}</p>
            <ul>
              <li>{{ t('privacy.s1.i1') }}</li>
              <li>{{ t('privacy.s1.i2') }}</li>
              <li>{{ t('privacy.s1.i3') }}</li>
            </ul>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>2. {{ t('privacy.s2.title') }}</h2>
            <p>{{ t('privacy.s2.body') }}</p>
            <ul>
              <li>{{ t('privacy.s2.i1') }}</li>
              <li>{{ t('privacy.s2.i2') }}</li>
              <li>{{ t('privacy.s2.i3') }}</li>
            </ul>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>3. {{ t('privacy.s3.title') }}</h2>
            <p>{{ t('privacy.s3.body') }}</p>
            <ul>
              <li>{{ t('privacy.s3.i1') }}</li>
              <li>{{ t('privacy.s3.i2') }}</li>
              <li>{{ t('privacy.s3.i3') }}</li>
            </ul>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>4. {{ t('privacy.s4.title') }}</h2>
            <p>{{ t('privacy.s4.body') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>5. {{ t('privacy.s5.title') }}</h2>
            <p>{{ t('privacy.s5.body') }}</p>
            <ul>
              <li>{{ t('privacy.s5.i1') }}</li>
              <li>{{ t('privacy.s5.i2') }}</li>
              <li>{{ t('privacy.s5.i3') }}</li>
              <li>{{ t('privacy.s5.i4') }}</li>
            </ul>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>6. {{ t('privacy.s6.title') }}</h2>
            <p>{{ t('privacy.s6.body') }}</p>
            <ul>
              <li>{{ t('privacy.s6.i1') }}</li>
              <li>{{ t('privacy.s6.i2') }}</li>
              <li>{{ t('privacy.s6.i3') }}</li>
            </ul>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>7. {{ t('privacy.s7.title') }}</h2>
            <p>{{ t('privacy.s7.body') }}</p>
          </section>

          <div class="legal-back">
            <RouterLink to="/">
              <Button :label="t('common.backToHome')" icon="pi pi-arrow-left" text />
            </RouterLink>
            <RouterLink to="/terms">
              <Button :label="t('footer.terms')" icon="pi pi-file" text />
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

const { t } = useI18n()
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

.legal-back {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
</style>
