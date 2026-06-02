import i18next, { type i18n } from "i18next"
import { defaultLocale, locales, type Locale } from "./config"
import {
  webI18nNamespaces,
  webI18nResources,
  type WebI18nNamespace,
  type WebI18nResourceShape,
} from "./resources"

type TranslationLeafPaths<TValue> = TValue extends string
  ? never
  : {
      [TKey in keyof TValue & string]: TValue[TKey] extends string
        ? TKey
        : TValue[TKey] extends ReadonlyArray<unknown>
          ? never
          : `${TKey}.${TranslationLeafPaths<TValue[TKey]>}`
    }[keyof TValue & string]

export type Messages = {
  [TNamespace in WebI18nNamespace]: WebI18nResourceShape[TNamespace]
}

export type WebNamespaceKey<TNamespace extends WebI18nNamespace> = TranslationLeafPaths<
  WebI18nResourceShape[TNamespace]
>

export type WebNamespaceTranslator<TNamespace extends WebI18nNamespace> = (
  key: WebNamespaceKey<TNamespace>,
  values?: Record<string, string>,
) => string

const webI18n = createWebI18n()

function createWebI18n(): i18n {
  const instance = i18next.createInstance()

  void instance.init({
    resources: webI18nResources,
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    supportedLngs: [...locales],
    ns: [...webI18nNamespaces],
    defaultNS: "metadata",
    interpolation: {
      escapeValue: false,
    },
    initImmediate: false,
  } as never)

  return instance
}

export function getWebTranslator<TNamespace extends WebI18nNamespace>(
  locale: Locale,
  namespace: TNamespace,
): WebNamespaceTranslator<TNamespace> {
  const translator = webI18n.getFixedT(locale, namespace)

  return (key, values) => translator(key as never, values as never) as unknown as string
}

export function getMessages(locale: Locale): Messages {
  return Object.fromEntries(
    webI18nNamespaces.map((namespace) => [
      namespace,
      webI18n.getResourceBundle(locale, namespace),
    ]),
  ) as Messages
}
