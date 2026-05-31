import { z } from 'zod'

export const STAT_VALUE_TYPES = ['integer', 'decimal', 'duration', 'boolean', 'text'] as const

export const StatValueTypeSchema = z.enum(STAT_VALUE_TYPES)

export type StatValueType = z.infer<typeof StatValueTypeSchema>
