import { z } from 'zod'

export const VISIBILITY_LEVELS = ['private', 'unlisted', 'public'] as const

export const VisibilitySchema = z.enum(VISIBILITY_LEVELS)

export type Visibility = z.infer<typeof VisibilitySchema>
