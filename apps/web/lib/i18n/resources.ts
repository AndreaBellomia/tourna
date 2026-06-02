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

interface CommonResource {
  product: string
  subtitle: string
  nav: {
    dashboard: string
    teams: string
    users: string
    profile: string
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

interface TeamsResource {
  nav: {
    dashboard: string
    teams: string
    logout: string
  }
  metadata: {
    title: string
    description: string
  }
  list: {
    eyebrow: string
    title: string
    description: string
    search: string
    searchPlaceholder: string
    visibility: string
    allVisibilities: string
    create: string
    reset: string
    loadMore: string
    loading: string
    emptyTitle: string
    emptyDescription: string
    unavailable: string
  }
  form: {
    title: string
    description: string
    name: string
    namePlaceholder: string
    summary: string
    summaryPlaceholder: string
    visibility: string
    submit: string
    success: string
    invalid: string
    failed: string
  }
  detail: {
    back: string
    overview: string
    settings: string
    members: string
    permissions: string
    status: string
    created: string
    editTitle: string
    editDescription: string
    membersTitle: string
    membersDescription: string
    permissionsTitle: string
    permissionsDescription: string
    disabledAction: string
  }
  visibility: {
    private: string
    unlisted: string
    public: string
  }
}

interface ProfileResource {
  metadata: {
    title: string
    description: string
  }
  form: {
    eyebrow: string
    title: string
    description: string
    displayName: string
    displayNamePlaceholder: string
    bio: string
    bioPlaceholder: string
    email: string
    avatar: string
    avatarHelp: string
    upload: string
    removeAvatar: string
    save: string
    saved: string
    failed: string
    invalid: string
    uploadFailed: string
    editMode: string
    previewMode: string
    emptyPreview: string
    publicProfile: string
  }
}

interface UsersResource {
  metadata: {
    title: string
    description: string
  }
  list: {
    eyebrow: string
    title: string
    description: string
    search: string
    searchPlaceholder: string
    reset: string
    loadMore: string
    emptyTitle: string
    emptyDescription: string
    unavailable: string
  }
  detail: {
    back: string
    overview: string
    joined: string
    emptyBio: string
  }
}

export const webI18nResources = {
  it: {
    metadata: itMetadata,
    common: itCommon,
    auth: itAuth,
    loginPage: itLoginPage,
    dashboard: itDashboard,
    teams: itTeams,
    profile: itProfile,
    users: itUsers,
  },
  en: {
    metadata: enMetadata,
    common: enCommon,
    auth: enAuth,
    loginPage: enLoginPage,
    dashboard: enDashboard,
    teams: enTeams,
    profile: enProfile,
    users: enUsers,
  },
} as const satisfies Record<
  Locale,
  {
    metadata: MetadataResource
    common: CommonResource
    auth: AuthResource
    loginPage: LoginPageResource
    dashboard: DashboardResource
    teams: TeamsResource
    profile: ProfileResource
    users: UsersResource
  }
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
] as const

export type WebI18nNamespace = (typeof webI18nNamespaces)[number]
export type WebI18nResourceShape = (typeof webI18nResources)['it']
