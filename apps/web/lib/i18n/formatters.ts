import type { Locale } from './config'

type DateInput = Date | number | string

export type I18nFormatters = {
  date: (value: DateInput, options?: Intl.DateTimeFormatOptions) => string
  dateTime: (value: DateInput, options?: Intl.DateTimeFormatOptions) => string
  number: (value: number, options?: Intl.NumberFormatOptions) => string
  percent: (value: number, options?: Intl.NumberFormatOptions) => string
  currency: (value: number, currency: string, options?: Intl.NumberFormatOptions) => string
  relativeTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ) => string
  list: (values: readonly string[], options?: Intl.ListFormatOptions) => string
}

export function createI18nFormatters(locale: Locale): I18nFormatters {
  return {
    date: (value, options) =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        ...options,
      }).format(toDate(value)),
    dateTime: (value, options) =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...options,
      }).format(toDate(value)),
    number: (value, options) => new Intl.NumberFormat(locale, options).format(value),
    percent: (value, options) =>
      new Intl.NumberFormat(locale, {
        style: 'percent',
        ...options,
      }).format(value),
    currency: (value, currency, options) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        ...options,
      }).format(value),
    relativeTime: (value, unit, options) =>
      new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
        ...options,
      }).format(value, unit),
    list: (values, options) => new Intl.ListFormat(locale, options).format(values),
  }
}

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value)
}
