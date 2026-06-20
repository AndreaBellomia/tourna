'use client'

import React, { createContext, useContext, useMemo } from 'react'
import type { i18n } from 'i18next'
import type { Locale } from './config'
import { createI18nFormatters, type I18nFormatters } from './formatters'
import { createI18nInstance, createNamespaceTranslator } from './translator'
import type { Messages, WebI18nNamespace } from './resources'

type I18nContextValue = {
  locale: Locale
  messages: Messages
  i18n: i18n
  format: I18nFormatters
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  children,
  locale,
  messages,
}: Readonly<{
  children: React.ReactNode
  locale: Locale
  messages: Messages
}>) {
  const value = useMemo<I18nContextValue>(
    () => {
      const i18nInstance = createI18nInstance(locale, messages)

      return {
        locale,
        messages,
        i18n: i18nInstance,
        format: createI18nFormatters(locale),
      }
    },
    [locale, messages],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider.')
  }

  return context
}

export function useMessages(): Messages {
  return useI18n().messages
}

export function useI18nResource(): Messages {
  return useI18n().messages
}

export function useFormatters(): I18nFormatters {
  return useI18n().format
}

export function useTranslations<TNamespace extends WebI18nNamespace>(namespace: TNamespace) {
  const { i18n } = useI18n()

  return useMemo(() => createNamespaceTranslator(i18n, namespace), [i18n, namespace])
}
