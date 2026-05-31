import { z } from 'zod'

export const ORGANIZATION_TYPES = ['community', 'company', 'club', 'organizer'] as const

export const OrganizationTypeSchema = z.enum(ORGANIZATION_TYPES)

export type OrganizationType = z.infer<typeof OrganizationTypeSchema>
