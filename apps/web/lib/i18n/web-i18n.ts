import 'server-only'

import { cache } from 'react'
import { notFound } from 'next/navigation'
import { defaultLocale, isLocale, resolveLocale, type Locale } from './config'
import { createI18nFormatters, type I18nFormatters } from './formatters'
import {
  createI18nInstance,
  createNamespaceTranslator,
  type WebNamespaceTranslator,
} from './translator'
import type {
  Messages,
  WebI18nNamespace,
} from './resources'

export type {
  Messages,
  WebI18nNamespace,
  WebNamespaceKey,
  WebI18nResourceShape,
} from './resources'
export type { WebNamespaceTranslator } from './translator'

type LocaleParams = {
  locale: string
}

type PageI18n<TParams extends LocaleParams> = {
  locale: Locale
  params: Omit<TParams, 'locale'> & { locale: Locale }
  messages: Messages
  format: I18nFormatters
}

type ResolvedLocaleParams<TParams extends LocaleParams> = {
  locale: Locale
  params: Omit<TParams, 'locale'> & { locale: Locale }
}

type MetadataTranslator<TParams extends LocaleParams, TNamespace extends WebI18nNamespace> =
  ResolvedLocaleParams<TParams> & {
    format: I18nFormatters
    t: WebNamespaceTranslator<TNamespace>
  }

const messageLoaders = {
  en: () => import('./locales/en').then((module) => module.default),
  it: () => import('./locales/it').then((module) => module.default),
} as const satisfies Record<Locale, () => Promise<Messages>>

export const getMessages = cache(async (locale: Locale): Promise<Messages> => {
  return messageLoaders[locale]()
})

export async function getWebTranslator<TNamespace extends WebI18nNamespace>(
  locale: Locale,
  namespace: TNamespace,
) {
  const messages = await getMessages(locale)

  return createNamespaceTranslator(createI18nInstance(locale, messages), namespace)
}

export async function getPageI18n<TParams extends LocaleParams>(
  params: Promise<TParams>,
): Promise<PageI18n<TParams>> {
  const { locale, params: resolvedParams } = await getLocaleParams(params)

  return createPageI18n(locale, resolvedParams)
}

export async function getLocaleParams<TParams extends LocaleParams>(
  params: Promise<TParams>,
): Promise<ResolvedLocaleParams<TParams>> {
  const resolvedParams = await params

  if (!isLocale(resolvedParams.locale)) {
    notFound()
  }

  return {
    locale: resolvedParams.locale,
    params: {
      ...resolvedParams,
      locale: resolvedParams.locale,
    } as Omit<TParams, 'locale'> & { locale: Locale },
  }
}

export async function getMetadataTranslator<
  TParams extends LocaleParams,
  TNamespace extends WebI18nNamespace,
>(
  params: Promise<TParams>,
  namespace: TNamespace,
): Promise<MetadataTranslator<TParams, TNamespace>> {
  const resolvedParams = await params
  const locale = resolveLocale(resolvedParams.locale)
  const messages = await getMessages(locale)

  return {
    locale,
    params: {
      ...resolvedParams,
      locale,
    } as Omit<TParams, 'locale'> & { locale: Locale },
    format: createI18nFormatters(locale),
    t: createNamespaceTranslator(createI18nInstance(locale, messages), namespace),
  }
}

export async function getDefaultMessages(): Promise<Messages> {
  return getMessages(defaultLocale)
}

async function createPageI18n<TParams extends LocaleParams>(
  locale: Locale,
  params: Omit<TParams, 'locale'> & { locale: Locale },
): Promise<PageI18n<TParams>> {
  const messages = await getMessages(locale)
  const format = createI18nFormatters(locale)

  return {
    locale,
    params,
    messages,
    format,
  }
}
