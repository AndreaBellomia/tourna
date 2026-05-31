import { z } from 'zod'

export const LIFECYCLE_STATUSES = [
  'draft',
  'published',
  'registration_open',
  'live',
  'completed',
  'cancelled',
  'archived',
] as const

export const LifecycleStatusSchema = z.enum(LIFECYCLE_STATUSES)

export type LifecycleStatus = z.infer<typeof LifecycleStatusSchema>
