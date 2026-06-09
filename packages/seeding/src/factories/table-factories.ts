import type { DatabaseSchema } from '@repo/db'
import type { Insertable } from 'kysely'
import { defineSeedFactory } from './seed-factory'

export type TableInsert<TTable extends keyof DatabaseSchema> = Insertable<DatabaseSchema[TTable]>

export type UserSeed = TableInsert<'users'>
export type OrganizationSeed = TableInsert<'organizations'>
export type MembershipSeed = TableInsert<'memberships'>
export type EventSeed = TableInsert<'events'>
export type DisciplineSeed = TableInsert<'disciplines'>
export type TagSeed = TableInsert<'tags'>
export type TeamSeed = TableInsert<'teams'>
export type TeamMembershipSeed = TableInsert<'team_memberships'>
export type ScoringProfileSeed = TableInsert<'scoring_profiles'>
export type TournamentSeed = TableInsert<'tournaments'>
export type TournamentTagSeed = TableInsert<'tournament_tags'>
export type TournamentEntrantSeed = TableInsert<'tournament_entrants'>
export type TournamentRosterSeed = TableInsert<'tournament_rosters'>
export type TournamentRosterMemberSeed = TableInsert<'tournament_roster_members'>
export type StageSeed = TableInsert<'stages'>
export type MatchSeed = TableInsert<'matches'>
export type MatchParticipantSeed = TableInsert<'match_participants'>
export type MatchLineupSeed = TableInsert<'match_lineups'>
export type MatchLineupMemberSeed = TableInsert<'match_lineup_members'>
export type ResultSubmissionSeed = TableInsert<'result_submissions'>
export type ResultConfirmationSeed = TableInsert<'result_confirmations'>
export type ResultEvidenceSeed = TableInsert<'result_evidence'>
export type ScoreAwardSeed = TableInsert<'score_awards'>
export type StandingSeed = TableInsert<'standings'>
export type StatDefinitionSeed = TableInsert<'stat_definitions'>
export type StatEventSeed = TableInsert<'stat_events'>
export type ScopeConstraintSeed = TableInsert<'scope_constraints'>

export interface TournaSeedFactories {
  user: ReturnType<typeof createUserFactory>
  organization: ReturnType<typeof createOrganizationFactory>
  membership: ReturnType<typeof createMembershipFactory>
  event: ReturnType<typeof createEventFactory>
  discipline: ReturnType<typeof createDisciplineFactory>
  tag: ReturnType<typeof createTagFactory>
  team: ReturnType<typeof createTeamFactory>
  teamMembership: ReturnType<typeof createTeamMembershipFactory>
  scoringProfile: ReturnType<typeof createScoringProfileFactory>
  tournament: ReturnType<typeof createTournamentFactory>
  tournamentTag: ReturnType<typeof createTournamentTagFactory>
  tournamentEntrant: ReturnType<typeof createTournamentEntrantFactory>
  tournamentRoster: ReturnType<typeof createTournamentRosterFactory>
  tournamentRosterMember: ReturnType<typeof createTournamentRosterMemberFactory>
  stage: ReturnType<typeof createStageFactory>
  match: ReturnType<typeof createMatchFactory>
  matchParticipant: ReturnType<typeof createMatchParticipantFactory>
  matchLineup: ReturnType<typeof createMatchLineupFactory>
  matchLineupMember: ReturnType<typeof createMatchLineupMemberFactory>
  resultSubmission: ReturnType<typeof createResultSubmissionFactory>
  resultConfirmation: ReturnType<typeof createResultConfirmationFactory>
  resultEvidence: ReturnType<typeof createResultEvidenceFactory>
  scoreAward: ReturnType<typeof createScoreAwardFactory>
  standing: ReturnType<typeof createStandingFactory>
  statDefinition: ReturnType<typeof createStatDefinitionFactory>
  statEvent: ReturnType<typeof createStatEventFactory>
  scopeConstraint: ReturnType<typeof createScopeConstraintFactory>
}

export function createTournaSeedFactories(): TournaSeedFactories {
  return {
    user: createUserFactory(),
    organization: createOrganizationFactory(),
    membership: createMembershipFactory(),
    event: createEventFactory(),
    discipline: createDisciplineFactory(),
    tag: createTagFactory(),
    team: createTeamFactory(),
    teamMembership: createTeamMembershipFactory(),
    scoringProfile: createScoringProfileFactory(),
    tournament: createTournamentFactory(),
    tournamentTag: createTournamentTagFactory(),
    tournamentEntrant: createTournamentEntrantFactory(),
    tournamentRoster: createTournamentRosterFactory(),
    tournamentRosterMember: createTournamentRosterMemberFactory(),
    stage: createStageFactory(),
    match: createMatchFactory(),
    matchParticipant: createMatchParticipantFactory(),
    matchLineup: createMatchLineupFactory(),
    matchLineupMember: createMatchLineupMemberFactory(),
    resultSubmission: createResultSubmissionFactory(),
    resultConfirmation: createResultConfirmationFactory(),
    resultEvidence: createResultEvidenceFactory(),
    scoreAward: createScoreAwardFactory(),
    standing: createStandingFactory(),
    statDefinition: createStatDefinitionFactory(),
    statEvent: createStatEventFactory(),
    scopeConstraint: createScopeConstraintFactory(),
  }
}

function createUserFactory() {
  return defineSeedFactory<UserSeed>(({ sequence, faker }) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const nickname = `player-${sequence.toString().padStart(2, '0')}`

    return {
      email: `${nickname}@tourna.test`,
      display_name: `${firstName} ${lastName}`,
      nickname,
      bio: `Seed profile for ${firstName} ${lastName}`,
      avatar_object_key: null,
      password_hash: '$2b$12$tourna.seed.password.hash.placeholder',
      deleted_at: null,
    }
  })
}

function createOrganizationFactory() {
  return defineSeedFactory<OrganizationSeed>(({ sequence, faker, slugify }) => {
    const name = normalizeDisplayName(faker.company.name(), `Organization ${sequence}`, 120)

    return {
      created_by_user_id: requiredRelation('created_by_user_id'),
      name,
      slug: `${slugify(name)}-${sequence}`,
      type: 'club',
      status: 'published',
      visibility: 'public',
      description: `Seed organization ${sequence}`,
    }
  })
}

function createMembershipFactory() {
  return defineSeedFactory<MembershipSeed>(() => ({
    user_id: requiredRelation('user_id'),
    scope_type: 'global',
    scope_id: null,
    role_code: 'player',
    status: 'active',
  }))
}

function createEventFactory() {
  return defineSeedFactory<EventSeed>(({ sequence, faker, slugify }) => {
    const name = normalizeDisplayName(
      `${faker.date.month()} ${faker.word.noun()} ${faker.helpers.arrayElement([
        'Championship',
        'Festival',
        'Circuit',
        'Showcase',
      ])}`,
      `Event ${sequence}`,
      160,
    )

    return {
      organization_id: null,
      created_by_user_id: requiredRelation('created_by_user_id'),
      name,
      slug: `${slugify(name)}-${sequence}`,
      description: `Seed event ${sequence}`,
      type: 'championship',
      status: 'published',
      visibility: 'public',
      starts_at: new Date('2026-07-01T10:00:00.000Z'),
      ends_at: new Date('2026-07-03T20:00:00.000Z'),
    }
  })
}

function createDisciplineFactory() {
  return defineSeedFactory<DisciplineSeed>(({ sequence, faker, slugify }) => {
    const name = normalizeDisplayName(
      `${faker.commerce.productAdjective()} ${faker.commerce.department()}`,
      `Discipline ${sequence}`,
      120,
    )

    return {
      name,
      slug: `${slugify(name)}-${sequence}`,
      kind: faker.helpers.arrayElement(['esport', 'sport', 'sim_racing', 'board_game', 'other']),
      description: `Seed discipline for ${name}`,
    }
  })
}

function createTagFactory() {
  return defineSeedFactory<TagSeed>(({ sequence, faker, slugify }) => {
    const label = normalizeDisplayName(faker.lorem.words({ min: 2, max: 3 }), `Tag ${sequence}`, 80)

    return {
      label,
      slug: `${slugify(label)}-${sequence}`,
    }
  })
}

function createTeamFactory() {
  return defineSeedFactory<TeamSeed>(({ sequence, faker, slugify }) => {
    const name = normalizeDisplayName(
      `${faker.word.adjective()} ${faker.word.noun()}`,
      `Team ${sequence}`,
      120,
    )

    return {
      created_by_user_id: requiredRelation('created_by_user_id'),
      organization_id: null,
      name,
      slug: `${slugify(name)}-${sequence}`,
      tag: teamTag(name, sequence),
      status: 'published',
      visibility: 'public',
      description: `Seed team ${sequence}`,
      logo_object_key: null,
    }
  })
}

function createTeamMembershipFactory() {
  return defineSeedFactory<TeamMembershipSeed>(() => ({
    team_id: requiredRelation('team_id'),
    user_id: requiredRelation('user_id'),
    role: 'player',
    status: 'active',
    joined_at: new Date('2026-01-01T00:00:00.000Z'),
    left_at: null,
  }))
}

function createScoringProfileFactory() {
  return defineSeedFactory<ScoringProfileSeed>(({ sequence, faker }) => ({
    organization_id: null,
    created_by_user_id: requiredRelation('created_by_user_id'),
    name: normalizeDisplayName(
      `${faker.word.adjective()} scoring profile`,
      `Scoring ${sequence}`,
      120,
    ),
    mode: 'win_loss',
    config: {
      win: 3,
      draw: 1,
      loss: 0,
    },
  }))
}

function createTournamentFactory() {
  return defineSeedFactory<TournamentSeed>(({ sequence, faker, slugify }) => {
    const name = normalizeDisplayName(
      `${faker.word.adjective()} ${faker.word.noun()} ${faker.helpers.arrayElement([
        'Open',
        'Cup',
        'League',
        'Series',
      ])}`,
      `Tournament ${sequence}`,
      160,
    )

    return {
      organization_id: null,
      event_id: null,
      created_by_user_id: requiredRelation('created_by_user_id'),
      discipline_id: requiredRelation('discipline_id'),
      scoring_profile_id: null,
      name,
      slug: `${slugify(name)}-${sequence}`,
      description: `Seed tournament ${sequence}`,
      type: 'tournament',
      participant_mode: 'team',
      format: 'single_elimination',
      status: 'registration_open',
      visibility: 'public',
      evidence_policy: 'optional',
      settings: {
        checkInRequired: true,
        maxEntrants: 16,
      },
      starts_at: new Date('2026-07-10T12:00:00.000Z'),
      ends_at: new Date('2026-07-10T22:00:00.000Z'),
    }
  })
}

function createTournamentTagFactory() {
  return defineSeedFactory<TournamentTagSeed>(() => ({
    tournament_id: requiredRelation('tournament_id'),
    tag_id: requiredRelation('tag_id'),
  }))
}

function createTournamentEntrantFactory() {
  return defineSeedFactory<TournamentEntrantSeed>(({ sequence }) => ({
    tournament_id: requiredRelation('tournament_id'),
    entrant_type: 'team',
    entrant_id: requiredRelation('entrant_id'),
    status: 'registered',
    seed: sequence,
  }))
}

function createTournamentRosterFactory() {
  return defineSeedFactory<TournamentRosterSeed>(({ sequence, faker }) => ({
    tournament_id: requiredRelation('tournament_id'),
    entrant_id: requiredRelation('entrant_id'),
    name: normalizeDisplayName(`${faker.word.adjective()} roster`, `Roster ${sequence}`, 120),
    status: 'approved',
  }))
}

function createTournamentRosterMemberFactory() {
  return defineSeedFactory<TournamentRosterMemberSeed>(({ sequence }) => ({
    roster_id: requiredRelation('roster_id'),
    user_id: requiredRelation('user_id'),
    role: sequence === 1 ? 'starter' : 'substitute',
    status: 'active',
  }))
}

function createStageFactory() {
  return defineSeedFactory<StageSeed>(({ sequence, faker }) => ({
    tournament_id: requiredRelation('tournament_id'),
    name: normalizeDisplayName(`${faker.word.adjective()} stage`, `Stage ${sequence}`, 120),
    type: 'bracket',
    order_index: sequence,
    status: 'published',
    settings: {
      bestOf: 3,
    },
    starts_at: new Date('2026-07-10T12:00:00.000Z'),
    ends_at: new Date('2026-07-10T22:00:00.000Z'),
  }))
}

function createMatchFactory() {
  return defineSeedFactory<MatchSeed>(({ sequence }) => ({
    tournament_id: requiredRelation('tournament_id'),
    stage_id: null,
    discipline_id: null,
    type: 'match',
    status: 'scheduled',
    order_index: sequence,
    scheduled_at: new Date('2026-07-10T13:00:00.000Z'),
    started_at: null,
    completed_at: null,
    metadata: {
      round: 1,
    },
  }))
}

function createMatchParticipantFactory() {
  return defineSeedFactory<MatchParticipantSeed>(({ sequence }) => ({
    match_id: requiredRelation('match_id'),
    entrant_id: requiredRelation('entrant_id'),
    slot: sequence,
    score: null,
    placement: null,
    is_winner: false,
    result_status: 'pending',
  }))
}

function createMatchLineupFactory() {
  return defineSeedFactory<MatchLineupSeed>(() => ({
    match_id: requiredRelation('match_id'),
    entrant_id: requiredRelation('entrant_id'),
  }))
}

function createMatchLineupMemberFactory() {
  return defineSeedFactory<MatchLineupMemberSeed>(() => ({
    lineup_id: requiredRelation('lineup_id'),
    user_id: requiredRelation('user_id'),
    role: 'player',
  }))
}

function createResultSubmissionFactory() {
  return defineSeedFactory<ResultSubmissionSeed>(() => ({
    match_id: requiredRelation('match_id'),
    submitted_by_user_id: requiredRelation('submitted_by_user_id'),
    submitted_by_type: 'admin',
    entrant_id: null,
    status: 'pending',
    payload: {},
  }))
}

function createResultConfirmationFactory() {
  return defineSeedFactory<ResultConfirmationSeed>(() => ({
    submission_id: requiredRelation('submission_id'),
    entrant_id: requiredRelation('entrant_id'),
    confirmed_by_user_id: requiredRelation('confirmed_by_user_id'),
    status: 'confirmed',
    note: null,
  }))
}

function createResultEvidenceFactory() {
  return defineSeedFactory<ResultEvidenceSeed>(({ faker }) => ({
    submission_id: requiredRelation('submission_id'),
    uploaded_by_user_id: requiredRelation('uploaded_by_user_id'),
    type: 'screenshot',
    url: faker.internet.url(),
    metadata: {},
  }))
}

function createScoreAwardFactory() {
  return defineSeedFactory<ScoreAwardSeed>(({ faker }) => ({
    tournament_id: requiredRelation('tournament_id'),
    match_id: null,
    entrant_id: requiredRelation('entrant_id'),
    source_type: 'admin_adjustment',
    points: '0',
    reason: normalizeDisplayName(faker.lorem.sentence(), 'Seed score award', 160),
  }))
}

function createStandingFactory() {
  return defineSeedFactory<StandingSeed>(({ sequence }) => ({
    tournament_id: requiredRelation('tournament_id'),
    stage_id: null,
    entrant_id: requiredRelation('entrant_id'),
    points: '0',
    wins: 0,
    draws: 0,
    losses: 0,
    played: 0,
    rank: sequence,
    tiebreakers: {},
  }))
}

function createStatDefinitionFactory() {
  return defineSeedFactory<StatDefinitionSeed>(({ sequence, faker }) => ({
    discipline_id: null,
    code: `seed_stat_${sequence}`,
    name: normalizeDisplayName(`${faker.word.adjective()} stat`, `Seed Stat ${sequence}`, 120),
    description: normalizeDisplayName(faker.lorem.sentence(), 'Seed statistic definition', 200),
    value_type: 'integer',
  }))
}

function createStatEventFactory() {
  return defineSeedFactory<StatEventSeed>(() => ({
    tournament_id: requiredRelation('tournament_id'),
    match_id: requiredRelation('match_id'),
    entrant_id: requiredRelation('entrant_id'),
    user_id: null,
    stat_definition_id: requiredRelation('stat_definition_id'),
    numeric_value: '1',
    text_value: null,
    boolean_value: null,
    duration_ms: null,
    metadata: {},
  }))
}

function createScopeConstraintFactory() {
  return defineSeedFactory<ScopeConstraintSeed>(() => ({
    scope_type: 'tournament',
    scope_id: requiredRelation('scope_id'),
    type: 'invite_only',
    config: {},
  }))
}

function requiredRelation(name: string): string {
  return `__seed_missing_${name}__`
}

function teamTag(name: string, sequence: number): string {
  const compact = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  return `${compact}${sequence.toString().padStart(4, '0')}`.slice(0, 4)
}

function normalizeDisplayName(value: string, fallback: string, maxLength: number): string {
  const normalized = value
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const safeValue = normalized.length >= 2 ? normalized : fallback

  return safeValue.slice(0, maxLength)
}
