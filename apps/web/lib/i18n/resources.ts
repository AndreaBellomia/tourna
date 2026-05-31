import type { Locale } from "./config"
import enAuth from "./locales/en/auth"
import enDashboard from "./locales/en/dashboard"
import enLoginPage from "./locales/en/login-page"
import enMetadata from "./locales/en/metadata"
import itAuth from "./locales/it/auth"
import itDashboard from "./locales/it/dashboard"
import itLoginPage from "./locales/it/login-page"
import itMetadata from "./locales/it/metadata"

interface MetadataResource {
  appName: string
  template: string
  description: string
  loginTitle: string
  loginDescription: string
  dashboardTitle: string
  dashboardDescription: string
}

interface AuthResource {
  badge: string
  version: string
  login: {
    tab: string
    title: string
    description: string
    action: string
  }
  signup: {
    tab: string
    title: string
    description: string
    action: string
  }
  fields: {
    email: string
    emailPlaceholder: string
    password: string
    passwordPlaceholder: string
  }
  errors: {
    invalidData: string
    invalidCredentials: string
    requestFailed: string
    email: string
    password: string
  }
}

interface LoginPageResource {
  product: string
  liveReady: string
  eyebrow: string
  title: string
  description: string
  matchMonitor: string
  bracketFlow: string
  bracket: {
    winner: string
    final: string
  }
  liveMatches: ReadonlyArray<{
    game: string
    stage: string
    teams: string
    score: string
  }>
}

interface DashboardResource {
  product: string
  logout: string
  stats: {
    tournaments: string
    liveMatches: string
    session: string
  }
  setupBadge: string
  title: string
  description: string
  sessionFallback: string
}

export const webI18nResources = {
  it: {
    metadata: itMetadata,
    auth: itAuth,
    loginPage: itLoginPage,
    dashboard: itDashboard,
  },
  en: {
    metadata: enMetadata,
    auth: enAuth,
    loginPage: enLoginPage,
    dashboard: enDashboard,
  },
} as const satisfies Record<
  Locale,
  {
    metadata: MetadataResource
    auth: AuthResource
    loginPage: LoginPageResource
    dashboard: DashboardResource
  }
>

export const webI18nNamespaces = ["metadata", "auth", "loginPage", "dashboard"] as const

export type WebI18nNamespace = (typeof webI18nNamespaces)[number]
export type WebI18nResourceShape = (typeof webI18nResources)["it"]
