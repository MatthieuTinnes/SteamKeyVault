<template>
  <div class="about">
    <Card>
      <template #title>{{ t('about.title') }}</template>
      <template #content>
        <h1>{{ t('about.body') }}</h1>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from 'primevue/card';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style>
@media (min-width: 64rem) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
