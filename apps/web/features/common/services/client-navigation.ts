'use client'

import { defaultLocale, isLocale, withLocale } from '~/lib/i18n/config'

export function redirectBrowserToLogin() {
  if (typeof window === 'undefined') {
    return
  }

  window.location.assign(withLocale(readBrowserLocale(), '/login'))
}

function readBrowserLocale() {
  const [, maybeLocale] = window.location.pathname.split('/')

  return maybeLocale && isLocale(maybeLocale) ? maybeLocale : defaultLocale
}
