import i18next, { type i18n, type TOptions } from 'i18next'
import type { Locale } from './config'
import type {
  Messages,
  WebI18nNamespace,
  WebNamespaceKey,
} from './resources'

export type WebNamespaceTranslator<TNamespace extends WebI18nNamespace> = (
  key: WebNamespaceKey<TNamespace>,
  options?: TOptions,
) => string

export function createI18nInstance(locale: Locale, messages: Messages): i18n {
  const instance = i18next.createInstance()

  void instance.init({
    resources: {
      [locale]: messages,
    },
    lng: locale,
    fallbackLng: locale,
    ns: Object.keys(messages),
    interpolation: {
      escapeValue: false,
    },
    initAsync: false,
  })

  return instance
}

export function createNamespaceTranslator<TNamespace extends WebI18nNamespace>(
  i18nInstance: i18n,
  namespace: TNamespace,
): WebNamespaceTranslator<TNamespace> {
  const t = i18nInstance.t as unknown as (key: string, options?: TOptions) => string

  return (key, options) => t(String(key), { ns: namespace, ...options })
}
