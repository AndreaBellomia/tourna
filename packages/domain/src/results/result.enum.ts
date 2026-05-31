import { z } from 'zod'

export const RESULT_SUBMITTER_TYPES = ['admin', 'entrant'] as const

export const ResultSubmitterTypeSchema = z.enum(RESULT_SUBMITTER_TYPES)

export type ResultSubmitterType = z.infer<typeof ResultSubmitterTypeSchema>

export const RESULT_SUBMISSION_STATUSES = ['pending', 'confirmed', 'disputed', 'rejected'] as const

export const ResultSubmissionStatusSchema = z.enum(RESULT_SUBMISSION_STATUSES)

export type ResultSubmissionStatus = z.infer<typeof ResultSubmissionStatusSchema>

export const RESULT_CONFIRMATION_STATUSES = ['confirmed', 'disputed'] as const

export const ResultConfirmationStatusSchema = z.enum(RESULT_CONFIRMATION_STATUSES)

export type ResultConfirmationStatus = z.infer<typeof ResultConfirmationStatusSchema>

export const EVIDENCE_TYPES = ['screenshot', 'video', 'link', 'file'] as const

export const EvidenceTypeSchema = z.enum(EVIDENCE_TYPES)

export type EvidenceType = z.infer<typeof EvidenceTypeSchema>
