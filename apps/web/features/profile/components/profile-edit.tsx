'use client'

import type { ProfileSummaryResponse } from '@repo/contracts/profile'
import { Locale } from '../../../lib/i18n/config'
import type { Messages } from '../../../lib/i18n/web-i18n'
import { ProfileForm } from './profile-form'

type ProfileEditPanelProps = {
  locale: Locale
  messages: Messages['profile']
  initialProfile: ProfileSummaryResponse
}

export function ProfileEditPanel({ locale, messages, initialProfile }: ProfileEditPanelProps) {
  return <ProfileForm locale={locale} messages={messages} profile={initialProfile} />
}
