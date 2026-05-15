import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/i18n'

export function useHreflang() {
  const route = useRoute()

  const links = computed(() => {
    const currentLocale = route.params.locale as string
    if (!currentLocale) return []

    const origin = window.location.origin
    const pathWithoutLocale = route.path.replace(new RegExp(`^/${currentLocale}`), '') || '/'
    const suffix = pathWithoutLocale === '/' ? '/' : pathWithoutLocale

    const result = SUPPORTED_LOCALES.map((loc) => ({
      rel: 'alternate',
      hreflang: loc,
      href: `${origin}/${loc}${suffix}`,
    }))

    result.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${origin}/${DEFAULT_LOCALE}${suffix}`,
    })

    return result
  })

  useHead({ link: links })
}
