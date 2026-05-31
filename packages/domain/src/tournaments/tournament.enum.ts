import { z } from 'zod'

export const DISCIPLINE_KINDS = ['esport', 'sport', 'sim_racing', 'board_game', 'other'] as const

export const DisciplineKindSchema = z.enum(DISCIPLINE_KINDS)

export type DisciplineKind = z.infer<typeof DisciplineKindSchema>

export const TOURNAMENT_TYPES = [
  'tournament',
  'league',
  'scrim',
  'friendly',
  'qualifier',
  'championship',
] as const

export const TournamentTypeSchema = z.enum(TOURNAMENT_TYPES)

export type TournamentType = z.infer<typeof TournamentTypeSchema>

export const PARTICIPANT_MODES = ['team', 'individual'] as const

export const ParticipantModeSchema = z.enum(PARTICIPANT_MODES)

export type ParticipantMode = z.infer<typeof ParticipantModeSchema>

export const TOURNAMENT_FORMATS = [
  'single_elimination',
  'round_robin',
  'points_league',
  'scrim',
] as const

export const TournamentFormatSchema = z.enum(TOURNAMENT_FORMATS)

export type TournamentFormat = z.infer<typeof TournamentFormatSchema>

export const EVIDENCE_POLICIES = ['none', 'optional', 'required'] as const

export const EvidencePolicySchema = z.enum(EVIDENCE_POLICIES)

export type EvidencePolicy = z.infer<typeof EvidencePolicySchema>

export const ENTRANT_TYPES = ['team', 'user'] as const

export const EntrantTypeSchema = z.enum(ENTRANT_TYPES)

export type EntrantType = z.infer<typeof EntrantTypeSchema>

export const ENTRANT_STATUSES = [
  'invited',
  'registered',
  'checked_in',
  'active',
  'eliminated',
  'withdrawn',
] as const

export const EntrantStatusSchema = z.enum(ENTRANT_STATUSES)

export type EntrantStatus = z.infer<typeof EntrantStatusSchema>

export const STAGE_TYPES = ['bracket', 'group', 'round', 'leaderboard', 'scrim_session'] as const

export const StageTypeSchema = z.enum(STAGE_TYPES)

export type StageType = z.infer<typeof StageTypeSchema>

export const MATCH_TYPES = ['match', 'race', 'heat', 'fixture'] as const

export const MatchTypeSchema = z.enum(MATCH_TYPES)

export type MatchType = z.infer<typeof MatchTypeSchema>

export const MATCH_STATUSES = [
  'scheduled',
  'live',
  'pending_confirmation',
  'disputed',
  'completed',
  'cancelled',
] as const

export const MatchStatusSchema = z.enum(MATCH_STATUSES)

export type MatchStatus = z.infer<typeof MatchStatusSchema>

export const PARTICIPANT_RESULT_STATUSES = ['pending', 'confirmed', 'disputed'] as const

export const ParticipantResultStatusSchema = z.enum(PARTICIPANT_RESULT_STATUSES)

export type ParticipantResultStatus = z.infer<typeof ParticipantResultStatusSchema>

export const SCORING_MODES = ['win_loss', 'placement_points', 'points_league', 'hybrid'] as const

export const ScoringModeSchema = z.enum(SCORING_MODES)

export type ScoringMode = z.infer<typeof ScoringModeSchema>

export const SCORE_AWARD_SOURCE_TYPES = [
  'match_result',
  'manual_bonus',
  'penalty',
  'admin_adjustment',
] as const

export const ScoreAwardSourceTypeSchema = z.enum(SCORE_AWARD_SOURCE_TYPES)

export type ScoreAwardSourceType = z.infer<typeof ScoreAwardSourceTypeSchema>

export const CONSTRAINT_SCOPES = ['event', 'tournament', 'registration'] as const

export const ConstraintScopeSchema = z.enum(CONSTRAINT_SCOPES)

export type ConstraintScope = z.infer<typeof ConstraintScopeSchema>

export const CONSTRAINT_TYPES = [
  'platform_only',
  'region_only',
  'invite_only',
  'min_rank',
  'max_rank',
  'age_limit',
  'custom',
] as const

export const ConstraintTypeSchema = z.enum(CONSTRAINT_TYPES)

export type ConstraintType = z.infer<typeof ConstraintTypeSchema>
