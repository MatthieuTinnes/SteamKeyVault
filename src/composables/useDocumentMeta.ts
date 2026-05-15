import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'

export function useDocumentMeta() {
  const { t, locale } = useI18n()

  useHead({
    title: computed(() => t('seo.title')),
    htmlAttrs: { lang: computed(() => locale.value) },
    meta: [
      { name: 'description', content: computed(() => t('seo.description')) },
      { property: 'og:title', content: computed(() => t('seo.ogTitle')) },
      { property: 'og:description', content: computed(() => t('seo.ogDescription')) },
      { name: 'twitter:title', content: computed(() => t('seo.ogTitle')) },
      { name: 'twitter:description', content: computed(() => t('seo.ogDescription')) },
    ],
  })
}
