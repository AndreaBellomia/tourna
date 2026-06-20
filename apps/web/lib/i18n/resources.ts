import type defaultMessages from './locales/en'

export type TranslationResourceShape<TValue> = TValue extends string
  ? string
  : TValue extends ReadonlyArray<infer TItem>
    ? ReadonlyArray<TranslationResourceShape<TItem>>
    : {
        readonly [TKey in keyof TValue]: TranslationResourceShape<TValue[TKey]>
      }

export type Messages = TranslationResourceShape<typeof defaultMessages>
export type WebI18nResourceShape = Messages
export type WebI18nNamespace = keyof WebI18nResourceShape

export type TranslationLeafPaths<TValue> = TValue extends string
  ? never
  : {
      [TKey in keyof TValue & string]: TValue[TKey] extends string
        ? TKey
        : TValue[TKey] extends ReadonlyArray<unknown>
          ? never
          : `${TKey}.${TranslationLeafPaths<TValue[TKey]>}`
    }[keyof TValue & string]

export type WebNamespaceKey<TNamespace extends WebI18nNamespace> = TranslationLeafPaths<
  WebI18nResourceShape[TNamespace]
>

export const webI18nNamespaces = [
  'metadata',
  'common',
  'auth',
  'loginPage',
  'dashboard',
  'teams',
  'profile',
  'users',
] as const satisfies readonly WebI18nNamespace[]
