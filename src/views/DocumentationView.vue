<template>
  <div class="documentation-view">
    <header class="doc-hero">
      <div class="hero-content">
        <p class="eyebrow">{{ t('docs.eyebrow') }}</p>
        <h1>{{ t('docs.title') }}</h1>
        <p class="subtitle">
          {{ t('docs.subtitle') }}
        </p>
      </div>
    </header>

    <main class="doc-content">
      <section class="toc">
        <h2>{{ t('docs.quickAccess') }}</h2>
        <div class="toc-grid">
          <a href="#encryption" class="toc-item">{{ t('docs.toc.encryption') }}</a>
          <a href="#import-export" class="toc-item">{{ t('docs.toc.importExport') }}</a>
          <a href="#sharing" class="toc-item">{{ t('docs.toc.sharing') }}</a>
          <a href="#custom-vs-steam" class="toc-item">{{ t('docs.toc.customVsSteam') }}</a>
          <a href="#lestrades" class="toc-item">{{ t('docs.toc.lestrades') }}</a>
          <a href="#delete-used" class="toc-item">{{ t('docs.toc.deleteUsed') }}</a>
          <a href="#qa" class="toc-item">{{ t('docs.toc.qa') }}</a>
        </div>
      </section>

      <section id="encryption" class="doc-section">
        <h2>{{ t('docs.encryption.title') }}</h2>
        <p>{{ t('docs.encryption.body') }}</p>
        <div class="doc-card">
          <h3>{{ t('docs.encryption.whyTitle') }}</h3>
          <ul>
            <li v-for="(item, index) in encryptionWhy" :key="index">{{ item }}</li>
          </ul>
        </div>
        <div class="doc-card">
          <h3>{{ t('docs.encryption.expectTitle') }}</h3>
          <ul>
            <li v-for="(item, index) in encryptionExpect" :key="index">{{ item }}</li>
          </ul>
        </div>
      </section>

      <section id="import-export" class="doc-section">
        <h2>{{ t('docs.importExport.title') }}</h2>
        <p>
          {{ t('docs.importExport.managePrefix') }}
          <strong>{{ t('nav.myAccount') }}</strong>
          {{ t('docs.importExport.manageMiddle') }}
          <strong>{{ t('import.title') }}</strong>
          {{ t('docs.importExport.manageSuffix') }}
        </p>
        <div class="doc-card">
          <h3>{{ t('docs.importExport.csvImportTitle') }}</h3>
          <ol>
            <li v-for="(item, index) in csvImportSteps" :key="index">{{ item }}</li>
          </ol>
          <p class="note">{{ t('docs.importExport.csvImportNote') }}</p>
        </div>
        <div class="doc-card">
          <h3>{{ t('docs.importExport.csvExportTitle') }}</h3>
          <ol>
            <li v-for="(item, index) in csvExportSteps" :key="index">{{ item }}</li>
          </ol>
        </div>
        <div class="doc-card">
          <h3>{{ t('docs.importExport.jsonTitle') }}</h3>
          <ul>
            <li v-for="(item, index) in jsonItems" :key="index">{{ item }}</li>
          </ul>
        </div>
      </section>

      <section id="sharing" class="doc-section">
        <h2>{{ t('docs.sharing.title') }}</h2>
        <p>{{ t('docs.sharing.body') }}</p>
        <div class="doc-card">
          <h3>{{ t('docs.sharing.createTitle') }}</h3>
          <ol>
            <li v-for="(item, index) in sharingCreateSteps" :key="index">{{ item }}</li>
          </ol>
        </div>
        <div class="doc-card">
          <h3>{{ t('docs.sharing.behaviorTitle') }}</h3>
          <ul>
            <li v-for="(item, index) in sharingBehavior" :key="index">{{ item }}</li>
          </ul>
        </div>
      </section>

      <section id="custom-vs-steam" class="doc-section">
        <h2>{{ t('docs.customVsSteam.title') }}</h2>
        <p>{{ t('docs.customVsSteam.body') }}</p>
        <div class="doc-card">
          <h3>{{ t('docs.customVsSteam.steamTitle') }}</h3>
          <ul>
            <li v-for="(item, index) in steamList" :key="index">{{ item }}</li>
          </ul>
        </div>
        <div class="doc-card">
          <h3>{{ t('docs.customVsSteam.customTitle') }}</h3>
          <ul>
            <li v-for="(item, index) in customList" :key="index">{{ item }}</li>
          </ul>
        </div>
      </section>

      <section id="lestrades" class="doc-section">
        <h2>{{ t('docs.lestrades.title') }}</h2>
        <p>{{ t('docs.lestrades.body') }}</p>
        <div class="doc-card">
          <h3>{{ t('docs.lestrades.whereTitle') }}</h3>
          <ol>
            <li v-for="(item, index) in lestradesWhere" :key="index">{{ item }}</li>
          </ol>
        </div>
        <div class="doc-card">
          <h3>{{ t('docs.lestrades.formatTitle') }}</h3>
          <ul>
            <li v-for="(item, index) in lestradesFormat" :key="index">{{ item }}</li>
          </ul>
        </div>
      </section>

      <section id="delete-used" class="doc-section">
        <h2>{{ t('docs.deleteUsed.title') }}</h2>
        <p>{{ t('docs.deleteUsed.body') }}</p>
        <div class="doc-card">
          <h3>{{ t('docs.deleteUsed.stepsTitle') }}</h3>
          <ol>
            <li v-for="(item, index) in deleteSteps" :key="index">{{ item }}</li>
          </ol>
          <p class="note">{{ t('docs.deleteUsed.note') }}</p>
        </div>
      </section>

      <section id="qa" class="doc-section">
        <h2>{{ t('docs.qa.title') }}</h2>
        <div class="doc-card">
          <h3>{{ qaItems[0].q }}</h3>
          <p>{{ qaItems[0].a }}</p>
        </div>
        <div class="doc-card">
          <h3>{{ qaItems[1].q }}</h3>
          <p>{{ qaItems[1].a }}</p>
        </div>
        <div class="doc-card">
          <h3>{{ qaItems[2].q }}</h3>
          <p>{{ qaItems[2].a }}</p>
        </div>
        <div class="doc-card">
          <h3>{{ qaItems[3].q }}</h3>
          <p>{{ qaItems[3].a }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()
const encryptionWhy = computed(() => tm('docs.encryption.whyList') as string[])
const encryptionExpect = computed(() => tm('docs.encryption.expectList') as string[])
const csvImportSteps = computed(() => tm('docs.importExport.csvImportSteps') as string[])
const csvExportSteps = computed(() => tm('docs.importExport.csvExportSteps') as string[])
const jsonItems = computed(() => tm('docs.importExport.jsonItems') as string[])
const sharingCreateSteps = computed(() => tm('docs.sharing.createSteps') as string[])
const sharingBehavior = computed(() => tm('docs.sharing.behaviorList') as string[])
const steamList = computed(() => tm('docs.customVsSteam.steamList') as string[])
const customList = computed(() => tm('docs.customVsSteam.customList') as string[])
const lestradesWhere = computed(() => tm('docs.lestrades.whereSteps') as string[])
const lestradesFormat = computed(() => tm('docs.lestrades.formatList') as string[])
const deleteSteps = computed(() => tm('docs.deleteUsed.steps') as string[])
const qaItems = computed(() => tm('docs.qa.items') as { q: string; a: string }[])
</script>

<style scoped>
.documentation-view {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-secondary), var(--bg-primary) 50%);
}

.doc-hero {
  padding: 3rem 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 55%);
}

.hero-content {
  max-width: 70rem;
  margin: 0 auto;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0 0 0.5rem;
}

.doc-hero h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 3vw, 2.75rem);
  color: var(--text-primary);
}

.subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 42rem;
}

.doc-content {
  max-width: 70rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  display: grid;
  gap: 2rem;
}

.toc {
  background: var(--bg-primary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.toc h2 {
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.toc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.75rem;
}

.toc-item {
  text-decoration: none;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: var(--bg-secondary);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toc-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.doc-section {
  display: grid;
  gap: 1rem;
}

.doc-section h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.6rem;
}

.doc-section p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.doc-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
}

.doc-card h3 {
  margin: 0 0 0.75rem;
  color: var(--text-primary);
}

.doc-card ul,
.doc-card ol {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.doc-card code {
  background: var(--bg-tertiary);
  padding: 0.1rem 0.35rem;
  border-radius: 0.35rem;
  color: var(--primary-color);
  font-family: monospace;
}

.note {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .doc-hero {
    padding: 2.5rem 1.25rem 1.5rem;
  }

  .doc-content {
    padding: 1.5rem 1.25rem 3rem;
  }
}
</style>
