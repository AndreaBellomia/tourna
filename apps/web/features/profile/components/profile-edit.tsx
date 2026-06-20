'use client'

import type { ProfileSummaryResponse } from '@repo/contracts/profile'
import { ProfileForm } from './profile-form'

type ProfileEditPanelProps = {
  initialProfile: ProfileSummaryResponse
}

export function ProfileEditPanel({ initialProfile }: ProfileEditPanelProps) {
  return <ProfileForm profile={initialProfile} />
}
