import i18next, { type i18n } from 'i18next'
import { defaultEmailLocale, emailLocales, type EmailLocale } from './config'
import {
  emailI18nNamespaces,
  emailI18nResources,
  type EmailI18nNamespace,
  type EmailI18nResourceShape,
} from './resources'

type TranslationLeafPaths<TValue> = TValue extends string
  ? never
  : {
      [TKey in keyof TValue & string]: TValue[TKey] extends string
        ? TKey
        : `${TKey}.${TranslationLeafPaths<TValue[TKey]>}`
    }[keyof TValue & string]

export type EmailNamespaceKey<TNamespace extends EmailI18nNamespace> = TranslationLeafPaths<
  EmailI18nResourceShape[TNamespace]
>

export type EmailNamespaceTranslator<TNamespace extends EmailI18nNamespace> = (
  key: EmailNamespaceKey<TNamespace>,
  values?: Record<string, string>,
) => string

let emailI18nInstancePromise: Promise<i18n> | undefined

async function initEmailI18n(): Promise<i18n> {
  const instance = i18next.createInstance()

  await instance.init({
    resources: emailI18nResources,
    lng: defaultEmailLocale,
    fallbackLng: defaultEmailLocale,
    supportedLngs: emailLocales,
    ns: [...emailI18nNamespaces],
    defaultNS: 'shell',
    interpolation: {
      escapeValue: false,
    },
  })

  return instance
}

export function getEmailI18n(): Promise<i18n> {
  if (!emailI18nInstancePromise) {
    emailI18nInstancePromise = initEmailI18n()
  }

  return emailI18nInstancePromise
}

export async function getEmailTranslator<TNamespace extends EmailI18nNamespace>(
  locale: EmailLocale,
  namespace: TNamespace,
): Promise<EmailNamespaceTranslator<TNamespace>> {
  const instance = await getEmailI18n()
  const translator = instance.getFixedT(locale, namespace as never)

  return (key, values) => translator(key as never, values as never) as unknown as string
}
