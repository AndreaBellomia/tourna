import type { Locale } from './config'
import enAuth from './locales/en/auth'
import enCommon from './locales/en/common'
import enDashboard from './locales/en/dashboard'
import enLoginPage from './locales/en/login-page'
import enMetadata from './locales/en/metadata'
import enProfile from './locales/en/profile'
import enTeams from './locales/en/teams'
import enUsers from './locales/en/users'
import itAuth from './locales/it/auth'
import itCommon from './locales/it/common'
import itDashboard from './locales/it/dashboard'
import itLoginPage from './locales/it/login-page'
import itMetadata from './locales/it/metadata'
import itProfile from './locales/it/profile'
import itTeams from './locales/it/teams'
import itUsers from './locales/it/users'

type TranslationResourceShape<TValue> = TValue extends string
  ? string
  : TValue extends ReadonlyArray<infer TItem>
    ? ReadonlyArray<TranslationResourceShape<TItem>>
    : {
        readonly [TKey in keyof TValue]: TranslationResourceShape<TValue[TKey]>
      }

const defaultWebI18nResource = {
  metadata: enMetadata,
  common: enCommon,
  auth: enAuth,
  loginPage: enLoginPage,
  dashboard: enDashboard,
  teams: enTeams,
  profile: enProfile,
  users: enUsers,
} as const

export type WebI18nResourceShape = TranslationResourceShape<typeof defaultWebI18nResource>
export type WebI18nNamespace = keyof WebI18nResourceShape

const italianWebI18nResource = {
  metadata: itMetadata,
  common: itCommon,
  auth: itAuth,
  loginPage: itLoginPage,
  dashboard: itDashboard,
  teams: itTeams,
  profile: itProfile,
  users: itUsers,
} as const satisfies WebI18nResourceShape

export const webI18nResources = {
  en: defaultWebI18nResource,
  it: italianWebI18nResource,
} as const satisfies Record<Locale, WebI18nResourceShape>

export const webI18nNamespaces = Object.keys(defaultWebI18nResource) as WebI18nNamespace[]
