import { z } from 'zod'

export const EVENT_TYPES = [
  'championship',
  'festival',
  'league_season',
  'circuit',
  'showcase',
] as const

export const EventTypeSchema = z.enum(EVENT_TYPES)

export type EventType = z.infer<typeof EventTypeSchema>
