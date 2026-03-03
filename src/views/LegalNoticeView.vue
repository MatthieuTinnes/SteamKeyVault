<template>
  <div class="legal-notice">
    <div class="legal-notice-container">
      <Card class="legal-card">
        <template #title>{{ t('legal.title') }}</template>
        <template #content>
          <section class="legal-section">
            <h2>{{ t('legal.disclaimer.title') }}</h2>
            <p>{{ t('legal.disclaimer.body') }}</p>
            <p class="legal-trademark">{{ t('legal.disclaimer.trademark') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>{{ t('legal.publisher.title') }}</h2>
            <p>{{ t('legal.publisher.body') }}</p>
            <ul>
              <li><strong>{{ t('legal.publisher.nameLabel') }}:</strong> SteamKeyVault</li>
              <li><strong>{{ t('legal.publisher.contactLabel') }}:</strong> {{ t('legal.publisher.contactValue') }}</li>
            </ul>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>{{ t('legal.hosting.title') }}</h2>
            <p>{{ t('legal.hosting.body') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>{{ t('legal.dataPrivacy.title') }}</h2>
            <p>{{ t('legal.dataPrivacy.body') }}</p>
          </section>

          <Divider />

          <section class="legal-section">
            <h2>{{ t('legal.liability.title') }}</h2>
            <p>{{ t('legal.liability.body') }}</p>
          </section>

          <div class="legal-back">
            <RouterLink to="/">
              <Button :label="t('common.backToHome')" icon="pi pi-arrow-left" text />
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
.legal-notice {
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.legal-notice-container {
  width: 100%;
  max-width: 860px;
}

.legal-card {
  width: 100%;
}

.legal-section {
  margin-bottom: 1.5rem;
}

.legal-section h2 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--p-primary-color);
}

.legal-section p,
.legal-section li {
  line-height: 1.7;
  font-size: 0.97rem;
}

.legal-section ul {
  padding-left: 1.25rem;
  margin-top: 0.5rem;
}

.legal-trademark {
  font-style: italic;
  opacity: 0.85;
  margin-top: 0.5rem;
}

.legal-back {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-start;
}

a {
  color: var(--p-primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
