<template>
  <div class="documentation-view">

    <!-- Hero -->
    <header class="doc-hero">
      <div class="doc-hero-inner">
        <div class="doc-hero-eyebrow">
          <i class="pi pi-book"></i>
          {{ t('docs.eyebrow') }}
        </div>
        <h1>{{ t('docs.title') }}</h1>
        <p class="doc-hero-subtitle">{{ t('docs.subtitle') }}</p>
      </div>
    </header>

    <div class="doc-layout">

      <!-- Sticky sidebar TOC -->
      <aside class="doc-sidebar">
        <nav class="toc-nav" aria-label="Table of contents">
          <div class="toc-label">{{ t('docs.quickAccess') }}</div>
          <a
            v-for="section in tocSections"
            :key="section.id"
            :href="`#${section.id}`"
            class="toc-link"
            :class="{ 'toc-active': activeSection === section.id }"
            @click.prevent="scrollTo(section.id)"
          >
            <i :class="['pi', section.icon]"></i>
            <span>{{ t(section.key) }}</span>
          </a>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="doc-content">

        <!-- ── Getting started ── -->
        <section id="getting-started" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-flag"></i></div>
            <h2>{{ t('docs.gettingStarted.title') }}</h2>
          </div>
          <p class="section-lead">{{ t('docs.gettingStarted.body') }}</p>
          <div class="doc-card">
            <h3>{{ t('docs.gettingStarted.registerTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in registerSteps" :key="i">{{ step }}</li>
            </ol>
          </div>
          <div class="doc-card doc-card-warning">
            <div class="card-warning-header">
              <i class="pi pi-exclamation-triangle"></i>
              <h3>{{ t('docs.gettingStarted.recoveryPhraseTitle') }}</h3>
            </div>
            <p>{{ t('docs.gettingStarted.recoveryPhraseBody') }}</p>
            <ul>
              <li v-for="(item, i) in recoveryPhraseList" :key="i">{{ item }}</li>
            </ul>
          </div>
        </section>

        <!-- ── Encryption ── -->
        <section id="encryption" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-lock"></i></div>
            <h2>{{ t('docs.encryption.title') }}</h2>
          </div>
          <p class="section-lead">{{ t('docs.encryption.body') }}</p>
          <div class="doc-card">
            <h3>{{ t('docs.encryption.whyTitle') }}</h3>
            <ul>
              <li v-for="(item, i) in encryptionWhy" :key="i">{{ item }}</li>
            </ul>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.encryption.expectTitle') }}</h3>
            <ul>
              <li v-for="(item, i) in encryptionExpect" :key="i">{{ item }}</li>
            </ul>
          </div>
        </section>

        <!-- ── Managing library ── -->
        <section id="managing-library" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-list"></i></div>
            <h2>{{ t('docs.managingLibrary.title') }}</h2>
          </div>
          <p class="section-lead">{{ t('docs.managingLibrary.body') }}</p>
          <div class="doc-card">
            <h3>{{ t('docs.managingLibrary.addGameTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in addGameSteps" :key="i">{{ step }}</li>
            </ol>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.managingLibrary.addKeyTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in addKeySteps" :key="i">{{ step }}</li>
            </ol>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.managingLibrary.statusesTitle') }}</h3>
            <p>{{ t('docs.managingLibrary.statusesBody') }}</p>
            <div class="status-list">
              <div v-for="status in keyStatuses" :key="status.name" class="status-item">
                <span class="status-badge" :class="`status-${status.name.toLowerCase()}`">{{ status.name }}</span>
                <span class="status-desc">{{ status.desc }}</span>
              </div>
            </div>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.managingLibrary.convertTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in convertSteps" :key="i">{{ step }}</li>
            </ol>
          </div>
        </section>

        <!-- ── Import / Export ── -->
        <section id="import-export" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-upload"></i></div>
            <h2>{{ t('docs.importExport.title') }}</h2>
          </div>
          <p class="section-lead">
            {{ t('docs.importExport.managePrefix') }}
            <strong>{{ t('nav.myAccount') }}</strong>
            {{ t('docs.importExport.manageMiddle') }}
            <strong>{{ t('import.title') }}</strong>
            {{ t('docs.importExport.manageSuffix') }}
          </p>
          <div class="doc-card">
            <h3>{{ t('docs.importExport.csvImportTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in csvImportSteps" :key="i">{{ step }}</li>
            </ol>
            <div class="code-block">
              <div class="code-label">CSV format</div>
              <pre><code>Portal 2;ABCD3-FGH12-JKLMN
DOOM Eternal;XY9PQ-KMT23-WVRZN;ZZ8LP-NRQ44-BTJKF
Custom Game;KEY1-XXXXX-XXXXX</code></pre>
            </div>
            <p class="note">{{ t('docs.importExport.csvImportNote') }}</p>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.importExport.csvExportTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in csvExportSteps" :key="i">{{ step }}</li>
            </ol>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.importExport.jsonTitle') }}</h3>
            <ul>
              <li v-for="(item, i) in jsonItems" :key="i">{{ item }}</li>
            </ul>
          </div>
        </section>

        <!-- ── Sharing ── -->
        <section id="sharing" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-share-alt"></i></div>
            <h2>{{ t('docs.sharing.title') }}</h2>
          </div>
          <p class="section-lead">{{ t('docs.sharing.body') }}</p>
          <div class="doc-card">
            <h3>{{ t('docs.sharing.createTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in sharingCreateSteps" :key="i">{{ step }}</li>
            </ol>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.sharing.behaviorTitle') }}</h3>
            <ul>
              <li v-for="(item, i) in sharingBehavior" :key="i">{{ item }}</li>
            </ul>
          </div>
        </section>

        <!-- ── Custom vs Steam ── -->
        <section id="custom-vs-steam" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-info-circle"></i></div>
            <h2>{{ t('docs.customVsSteam.title') }}</h2>
          </div>
          <p class="section-lead">{{ t('docs.customVsSteam.body') }}</p>
          <div class="doc-cards-row">
            <div class="doc-card">
              <h3>{{ t('docs.customVsSteam.steamTitle') }}</h3>
              <ul>
                <li v-for="(item, i) in steamList" :key="i">{{ item }}</li>
              </ul>
            </div>
            <div class="doc-card">
              <h3>{{ t('docs.customVsSteam.customTitle') }}</h3>
              <ul>
                <li v-for="(item, i) in customList" :key="i">{{ item }}</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- ── LesTrades ── -->
        <section id="lestrades" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-external-link"></i></div>
            <h2>{{ t('docs.lestrades.title') }}</h2>
          </div>
          <p class="section-lead">{{ t('docs.lestrades.body') }}</p>
          <div class="doc-card">
            <h3>{{ t('docs.lestrades.whereTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in lestradesWhere" :key="i">{{ step }}</li>
            </ol>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.lestrades.formatTitle') }}</h3>
            <ul>
              <li v-for="(item, i) in lestradesFormat" :key="i">{{ item }}</li>
            </ul>
            <div class="code-block">
              <div class="code-label">Output example</div>
              <pre><code>Half-Life: Alyx/546560
Portal 2/620
My Custom Game</code></pre>
            </div>
          </div>
        </section>

        <!-- ── Delete used ── -->
        <section id="delete-used" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-trash"></i></div>
            <h2>{{ t('docs.deleteUsed.title') }}</h2>
          </div>
          <p class="section-lead">{{ t('docs.deleteUsed.body') }}</p>
          <div class="doc-card">
            <h3>{{ t('docs.deleteUsed.stepsTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in deleteSteps" :key="i">{{ step }}</li>
            </ol>
            <p class="note note-danger">
              <i class="pi pi-exclamation-circle"></i>
              {{ t('docs.deleteUsed.note') }}
            </p>
          </div>
        </section>

        <!-- ── Account settings ── -->
        <section id="account-settings" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-cog"></i></div>
            <h2>{{ t('docs.accountSettings.title') }}</h2>
          </div>
          <p class="section-lead">{{ t('docs.accountSettings.body') }}</p>
          <div class="doc-card">
            <h3>{{ t('docs.accountSettings.passwordTitle') }}</h3>
            <p>{{ t('docs.accountSettings.passwordBody') }}</p>
            <ol>
              <li v-for="(step, i) in passwordSteps" :key="i">{{ step }}</li>
            </ol>
            <p class="note">{{ t('docs.accountSettings.passwordNote') }}</p>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.accountSettings.emailTitle') }}</h3>
            <ol>
              <li v-for="(step, i) in emailSteps" :key="i">{{ step }}</li>
            </ol>
          </div>
          <div class="doc-card">
            <h3>{{ t('docs.accountSettings.markdownTitle') }}</h3>
            <p>{{ t('docs.accountSettings.markdownBody') }}</p>
            <ol>
              <li v-for="(step, i) in markdownSteps" :key="i">{{ step }}</li>
            </ol>
          </div>
        </section>

        <!-- ── Q&A ── -->
        <section id="qa" class="doc-section">
          <div class="section-heading">
            <div class="section-icon"><i class="pi pi-question-circle"></i></div>
            <h2>{{ t('docs.qa.title') }}</h2>
          </div>
          <div class="qa-list">
            <div class="doc-card qa-item" v-for="(item, i) in qaItems" :key="i">
              <h3>{{ item.q }}</h3>
              <p>{{ item.a }}</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()

// ── SEO ──────────────────────────────────────────────────────────────
onMounted(() => {
  document.title = 'Documentation — SteamKeyVault'
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      'SteamKeyVault user guide: encryption, key sharing, CSV/JSON import/export, account settings, recovery phrase, and more.'
    )
  }
})

// ── Active section tracking via IntersectionObserver ─────────────────
const activeSection = ref<string>('getting-started')
let observer: IntersectionObserver | null = null

onMounted(() => {
  const sections = document.querySelectorAll<HTMLElement>('.doc-section')
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
          break
        }
      }
    },
    { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
  )
  sections.forEach((s) => observer!.observe(s))
})

onUnmounted(() => observer?.disconnect())

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const navbarHeight = 72
  const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight
  window.scrollTo({ top, behavior: 'smooth' })
  activeSection.value = id
}

// ── TOC sections (static — labels come from i18n) ─────────────────────
const tocSections = [
  { id: 'getting-started',  icon: 'pi-flag',           key: 'docs.toc.gettingStarted'  },
  { id: 'encryption',       icon: 'pi-lock',           key: 'docs.toc.encryption'       },
  { id: 'managing-library', icon: 'pi-list',           key: 'docs.toc.managingLibrary'  },
  { id: 'import-export',    icon: 'pi-upload',         key: 'docs.toc.importExport'     },
  { id: 'sharing',          icon: 'pi-share-alt',      key: 'docs.toc.sharing'          },
  { id: 'custom-vs-steam',  icon: 'pi-info-circle',    key: 'docs.toc.customVsSteam'    },
  { id: 'lestrades',        icon: 'pi-external-link',  key: 'docs.toc.lestrades'        },
  { id: 'delete-used',      icon: 'pi-trash',          key: 'docs.toc.deleteUsed'       },
  { id: 'account-settings', icon: 'pi-cog',            key: 'docs.toc.accountSettings'  },
  { id: 'qa',               icon: 'pi-question-circle',key: 'docs.toc.qa'               },
]

// ── Computed lists from i18n ──────────────────────────────────────────
const registerSteps     = computed(() => tm('docs.gettingStarted.registerSteps')    as string[])
const recoveryPhraseList= computed(() => tm('docs.gettingStarted.recoveryPhraseList') as string[])
const encryptionWhy     = computed(() => tm('docs.encryption.whyList')              as string[])
const encryptionExpect  = computed(() => tm('docs.encryption.expectList')           as string[])
const addGameSteps      = computed(() => tm('docs.managingLibrary.addGameSteps')    as string[])
const addKeySteps       = computed(() => tm('docs.managingLibrary.addKeySteps')     as string[])
const keyStatuses       = computed(() => tm('docs.managingLibrary.statuses')        as { name: string; desc: string }[])
const convertSteps      = computed(() => tm('docs.managingLibrary.convertSteps')    as string[])
const csvImportSteps    = computed(() => tm('docs.importExport.csvImportSteps')     as string[])
const csvExportSteps    = computed(() => tm('docs.importExport.csvExportSteps')     as string[])
const jsonItems         = computed(() => tm('docs.importExport.jsonItems')          as string[])
const sharingCreateSteps= computed(() => tm('docs.sharing.createSteps')             as string[])
const sharingBehavior   = computed(() => tm('docs.sharing.behaviorList')            as string[])
const steamList         = computed(() => tm('docs.customVsSteam.steamList')         as string[])
const customList        = computed(() => tm('docs.customVsSteam.customList')        as string[])
const lestradesWhere    = computed(() => tm('docs.lestrades.whereSteps')            as string[])
const lestradesFormat   = computed(() => tm('docs.lestrades.formatList')            as string[])
const deleteSteps       = computed(() => tm('docs.deleteUsed.steps')                as string[])
const passwordSteps     = computed(() => tm('docs.accountSettings.passwordSteps')   as string[])
const emailSteps        = computed(() => tm('docs.accountSettings.emailSteps')      as string[])
const markdownSteps     = computed(() => tm('docs.accountSettings.markdownSteps')   as string[])
const qaItems           = computed(() => tm('docs.qa.items')                        as { q: string; a: string }[])
</script>

<style scoped>
/* ═══════════════════════════════════════════
   Base
   ═══════════════════════════════════════════ */
.documentation-view {
  min-height: 100vh;
  background: var(--bg-secondary);
  overflow-x: hidden;
}

/* ═══════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════ */
.doc-hero {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 3.5rem 2rem 3rem;
  background-image: radial-gradient(ellipse at 0% 0%, color-mix(in srgb, var(--primary-color) 10%, transparent) 0%, transparent 60%);
}

.doc-hero-inner {
  max-width: 72rem;
  margin: 0 auto;
}

.doc-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.doc-hero h1 {
  margin: 0 0 0.85rem;
  font-size: clamp(1.85rem, 3vw, 2.75rem);
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.15;
  color: var(--text-primary);
}

.doc-hero-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 44rem;
  line-height: 1.6;
}

/* ═══════════════════════════════════════════
   Layout
   ═══════════════════════════════════════════ */
.doc-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  max-width: 72rem;
  margin: 0 auto;
  padding: 2.5rem 2rem 6rem;
  gap: 3rem;
  align-items: start;
  min-width: 0;
}

/* ═══════════════════════════════════════════
   Sidebar TOC
   ═══════════════════════════════════════════ */
.doc-sidebar {
  position: sticky;
  top: 5rem;
}

.toc-nav {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toc-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  padding: 0 0.5rem 0.6rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.4rem;
}

.toc-link {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.6rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
}

.toc-link .pi {
  font-size: 0.8rem;
  width: 1rem;
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: color 0.15s;
}

.toc-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.toc-link:hover .pi {
  color: var(--text-secondary);
}

.toc-link.toc-active {
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  color: var(--primary-color);
  font-weight: 600;
}

.toc-link.toc-active .pi {
  color: var(--primary-color);
}

/* ═══════════════════════════════════════════
   Content
   ═══════════════════════════════════════════ */
.doc-content {
  display: grid;
  gap: 3.5rem;
  min-width: 0;
  max-width: 100%;
}

/* ── Section ── */
.doc-section {
  display: grid;
  gap: 1rem;
  scroll-margin-top: 5.5rem;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 0.25rem;
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-icon .pi {
  font-size: 1.05rem;
  color: var(--primary-color);
}

.doc-section h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

.section-lead {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.65;
  font-size: 1rem;
}

/* ── Cards ── */
.doc-card {
  background: var(--bg-primary);
  border-radius: 0.875rem;
  border: 1px solid var(--border-color);
  padding: 1.35rem 1.5rem;
  box-shadow: var(--shadow-sm);
  overflow-wrap: break-word;
  word-break: break-word;
  min-width: 0;
}

.doc-card h3 {
  margin: 0 0 0.85rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.doc-card p {
  color: var(--text-secondary);
  margin: 0 0 0.85rem;
  line-height: 1.65;
}

.doc-card p:last-child {
  margin-bottom: 0;
}

.doc-card ul,
.doc-card ol {
  margin: 0 0 0.75rem;
  padding-left: 1.35rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.doc-card ul:last-child,
.doc-card ol:last-child {
  margin-bottom: 0;
}

.doc-card li {
  margin-bottom: 0.3rem;
}

.doc-card li:last-child {
  margin-bottom: 0;
}

/* Side-by-side card pair */
.doc-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* ── Warning card ── */
.doc-card-warning {
  border-color: color-mix(in srgb, #f59e0b 35%, var(--border-color));
  background: color-mix(in srgb, #f59e0b 5%, var(--bg-primary));
}

.card-warning-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}

.card-warning-header .pi {
  color: #d97706;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.card-warning-header h3 {
  margin: 0;
  color: #92400e;
  font-size: 0.975rem;
}

.my-app-dark .card-warning-header h3 {
  color: #fde68a;
}

.my-app-dark .doc-card-warning {
  background: color-mix(in srgb, #f59e0b 6%, var(--bg-primary));
}

/* ── Code block ── */
.code-block {
  margin-top: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 0.6rem;
  overflow: hidden;
}

.code-label {
  background: var(--bg-tertiary);
  padding: 0.35rem 0.85rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.code-block pre {
  margin: 0;
  padding: 0.85rem;
  background: var(--bg-secondary);
  overflow-x: auto;
  max-width: 100%;
}

.code-block code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  color: var(--primary-color);
  background: none;
  padding: 0;
}

/* ── Notes ── */
.note {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  line-height: 1.5;
}

.note-danger {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  color: #dc2626;
}

.my-app-dark .note-danger {
  color: #fca5a5;
}

.note-danger .pi {
  flex-shrink: 0;
  margin-top: 0.1rem;
}

/* ── Key status badges ── */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.75rem;
}

.status-item {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-available {
  background: color-mix(in srgb, #22c55e 15%, transparent);
  color: #16a34a;
}

.status-sharing {
  background: color-mix(in srgb, #3b82f6 15%, transparent);
  color: #2563eb;
}

.status-used {
  background: color-mix(in srgb, #6b7280 15%, transparent);
  color: #6b7280;
}

.status-desc {
  color: var(--text-secondary);
  line-height: 1.5;
}

/* ── Q&A ── */
.qa-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.qa-item h3 {
  font-size: 0.925rem;
}

.qa-item p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

/* ═══════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════ */
@media (max-width: 1024px) {
  .doc-layout {
    grid-template-columns: 200px 1fr;
    gap: 2rem;
  }
}

@media (max-width: 860px) {
  .doc-layout {
    grid-template-columns: 1fr;
    padding: 1.5rem 1rem 4rem;
  }

  .doc-sidebar {
    position: static;
  }

  .toc-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
    padding: 0.75rem;
  }

  .toc-label {
    width: 100%;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0.2rem;
    padding-bottom: 0.4rem;
  }

  .toc-link {
    padding: 0.35rem 0.55rem;
    font-size: 0.78rem;
  }

  .doc-cards-row {
    grid-template-columns: 1fr;
  }

  .qa-list {
    grid-template-columns: 1fr;
  }

  .doc-hero {
    padding: 2.5rem 1rem 2rem;
  }
}

@media (max-width: 600px) {
  .doc-hero {
    padding: 2rem 0.75rem 1.5rem;
  }

  .doc-hero-subtitle {
    font-size: 0.95rem;
  }

  .doc-layout {
    padding: 1.25rem 0.75rem 3rem;
  }

  .doc-section h2 {
    font-size: 1.3rem;
  }

  .doc-card {
    padding: 1rem 1rem;
    border-radius: 0.75rem;
  }

  .section-heading {
    gap: 0.5rem;
  }

  .section-icon {
    width: 30px;
    height: 30px;
  }

  .section-icon .pi {
    font-size: 0.9rem;
  }

  .toc-nav {
    padding: 0.5rem;
  }

  .toc-link {
    padding: 0.3rem 0.45rem;
    font-size: 0.72rem;
  }

  .toc-link .pi {
    display: none;
  }

  .code-block code {
    font-size: 0.7rem;
  }

  .code-block pre {
    padding: 0.6rem;
  }
}
</style>
