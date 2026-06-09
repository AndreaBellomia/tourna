import type { KyselyDatabase } from '@repo/db'
import type { Selectable } from 'kysely'
import type { DatabaseSchema } from '@repo/db'
import type {
  DisciplineSeed,
  EventSeed,
  MatchParticipantSeed,
  MatchSeed,
  MembershipSeed,
  OrganizationSeed,
  ScoringProfileSeed,
  StageSeed,
  StandingSeed,
  TagSeed,
  TeamMembershipSeed,
  TeamSeed,
  TournamentEntrantSeed,
  TournamentRosterMemberSeed,
  TournamentRosterSeed,
  TournamentSeed,
  TournamentTagSeed,
  UserSeed,
} from '../factories'

export type SeedRow<TTable extends keyof DatabaseSchema> = Selectable<DatabaseSchema[TTable]>

export async function getOrInsertUser(
  db: KyselyDatabase,
  seed: UserSeed,
): Promise<SeedRow<'users'>> {
  const existing = await db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', seed.email)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  return existing ?? db.insertInto('users').values(seed).returningAll().executeTakeFirstOrThrow()
}

export async function getOrInsertOrganization(
  db: KyselyDatabase,
  seed: OrganizationSeed,
): Promise<SeedRow<'organizations'>> {
  const existing = await db
    .selectFrom('organizations')
    .selectAll()
    .where('slug', '=', seed.slug)
    .executeTakeFirst()

  return (
    existing ?? db.insertInto('organizations').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertMembership(
  db: KyselyDatabase,
  seed: MembershipSeed,
): Promise<SeedRow<'memberships'>> {
  let query = db
    .selectFrom('memberships')
    .selectAll()
    .where('user_id', '=', seed.user_id)
    .where('scope_type', '=', seed.scope_type)
    .where('role_code', '=', seed.role_code)

  query =
    seed.scope_id === null || seed.scope_id === undefined
      ? query.where('scope_id', 'is', null)
      : query.where('scope_id', '=', seed.scope_id)

  const existing = await query.executeTakeFirst()

  return (
    existing ?? db.insertInto('memberships').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertEvent(
  db: KyselyDatabase,
  seed: EventSeed,
): Promise<SeedRow<'events'>> {
  let query = db.selectFrom('events').selectAll().where('slug', '=', seed.slug)

  query =
    seed.organization_id === null || seed.organization_id === undefined
      ? query.where('organization_id', 'is', null)
      : query.where('organization_id', '=', seed.organization_id)

  const existing = await query.executeTakeFirst()

  return existing ?? db.insertInto('events').values(seed).returningAll().executeTakeFirstOrThrow()
}

export async function getOrInsertDiscipline(
  db: KyselyDatabase,
  seed: DisciplineSeed,
): Promise<SeedRow<'disciplines'>> {
  const existing = await db
    .selectFrom('disciplines')
    .selectAll()
    .where('slug', '=', seed.slug)
    .executeTakeFirst()

  return (
    existing ?? db.insertInto('disciplines').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertTag(db: KyselyDatabase, seed: TagSeed): Promise<SeedRow<'tags'>> {
  const existing = await db
    .selectFrom('tags')
    .selectAll()
    .where('slug', '=', seed.slug)
    .executeTakeFirst()

  return existing ?? db.insertInto('tags').values(seed).returningAll().executeTakeFirstOrThrow()
}

export async function getOrInsertTeam(
  db: KyselyDatabase,
  seed: TeamSeed,
): Promise<SeedRow<'teams'>> {
  let query = db.selectFrom('teams').selectAll().where('slug', '=', seed.slug)

  query =
    seed.organization_id === null || seed.organization_id === undefined
      ? query.where('organization_id', 'is', null)
      : query.where('organization_id', '=', seed.organization_id)

  const existing = await query.executeTakeFirst()

  return existing ?? db.insertInto('teams').values(seed).returningAll().executeTakeFirstOrThrow()
}

export async function getOrInsertTeamMembership(
  db: KyselyDatabase,
  seed: TeamMembershipSeed,
): Promise<SeedRow<'team_memberships'>> {
  const existing = await db
    .selectFrom('team_memberships')
    .selectAll()
    .where('team_id', '=', seed.team_id)
    .where('user_id', '=', seed.user_id)
    .where('left_at', 'is', null)
    .executeTakeFirst()

  return (
    existing ??
    db.insertInto('team_memberships').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertScoringProfile(
  db: KyselyDatabase,
  seed: ScoringProfileSeed,
): Promise<SeedRow<'scoring_profiles'>> {
  let query = db.selectFrom('scoring_profiles').selectAll().where('name', '=', seed.name)

  query =
    seed.organization_id === null || seed.organization_id === undefined
      ? query.where('organization_id', 'is', null)
      : query.where('organization_id', '=', seed.organization_id)

  const existing = await query.executeTakeFirst()

  return (
    existing ??
    db.insertInto('scoring_profiles').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertTournament(
  db: KyselyDatabase,
  seed: TournamentSeed,
): Promise<SeedRow<'tournaments'>> {
  let query = db.selectFrom('tournaments').selectAll().where('slug', '=', seed.slug)

  query =
    seed.organization_id === null || seed.organization_id === undefined
      ? query.where('organization_id', 'is', null)
      : query.where('organization_id', '=', seed.organization_id)
  query =
    seed.event_id === null || seed.event_id === undefined
      ? query.where('event_id', 'is', null)
      : query.where('event_id', '=', seed.event_id)

  const existing = await query.executeTakeFirst()

  return (
    existing ?? db.insertInto('tournaments').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertTournamentTag(
  db: KyselyDatabase,
  seed: TournamentTagSeed,
): Promise<SeedRow<'tournament_tags'>> {
  const existing = await db
    .selectFrom('tournament_tags')
    .selectAll()
    .where('tournament_id', '=', seed.tournament_id)
    .where('tag_id', '=', seed.tag_id)
    .executeTakeFirst()

  return (
    existing ??
    db.insertInto('tournament_tags').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertTournamentEntrant(
  db: KyselyDatabase,
  seed: TournamentEntrantSeed,
): Promise<SeedRow<'tournament_entrants'>> {
  const existing = await db
    .selectFrom('tournament_entrants')
    .selectAll()
    .where('tournament_id', '=', seed.tournament_id)
    .where('entrant_type', '=', seed.entrant_type)
    .where('entrant_id', '=', seed.entrant_id)
    .executeTakeFirst()

  return (
    existing ??
    db.insertInto('tournament_entrants').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertTournamentRoster(
  db: KyselyDatabase,
  seed: TournamentRosterSeed,
): Promise<SeedRow<'tournament_rosters'>> {
  const existing = await db
    .selectFrom('tournament_rosters')
    .selectAll()
    .where('tournament_id', '=', seed.tournament_id)
    .where('entrant_id', '=', seed.entrant_id)
    .executeTakeFirst()

  return (
    existing ??
    db.insertInto('tournament_rosters').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertTournamentRosterMember(
  db: KyselyDatabase,
  seed: TournamentRosterMemberSeed,
): Promise<SeedRow<'tournament_roster_members'>> {
  const existing = await db
    .selectFrom('tournament_roster_members')
    .selectAll()
    .where('roster_id', '=', seed.roster_id)
    .where('user_id', '=', seed.user_id)
    .executeTakeFirst()

  return (
    existing ??
    db.insertInto('tournament_roster_members').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertStage(
  db: KyselyDatabase,
  seed: StageSeed,
): Promise<SeedRow<'stages'>> {
  const existing = await db
    .selectFrom('stages')
    .selectAll()
    .where('tournament_id', '=', seed.tournament_id)
    .where('order_index', '=', seed.order_index)
    .executeTakeFirst()

  return existing ?? db.insertInto('stages').values(seed).returningAll().executeTakeFirstOrThrow()
}

export async function getOrInsertMatch(
  db: KyselyDatabase,
  seed: MatchSeed,
): Promise<SeedRow<'matches'>> {
  let query = db.selectFrom('matches').selectAll().where('tournament_id', '=', seed.tournament_id)

  query =
    seed.stage_id === null || seed.stage_id === undefined
      ? query.where('stage_id', 'is', null)
      : query.where('stage_id', '=', seed.stage_id)
  query =
    seed.order_index === null || seed.order_index === undefined
      ? query.where('order_index', 'is', null)
      : query.where('order_index', '=', seed.order_index)

  const existing = await query.executeTakeFirst()

  return existing ?? db.insertInto('matches').values(seed).returningAll().executeTakeFirstOrThrow()
}

export async function getOrInsertMatchParticipant(
  db: KyselyDatabase,
  seed: MatchParticipantSeed,
): Promise<SeedRow<'match_participants'>> {
  const existing = await db
    .selectFrom('match_participants')
    .selectAll()
    .where('match_id', '=', seed.match_id)
    .where('slot', '=', seed.slot)
    .executeTakeFirst()

  return (
    existing ??
    db.insertInto('match_participants').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}

export async function getOrInsertStanding(
  db: KyselyDatabase,
  seed: StandingSeed,
): Promise<SeedRow<'standings'>> {
  let query = db
    .selectFrom('standings')
    .selectAll()
    .where('tournament_id', '=', seed.tournament_id)
    .where('entrant_id', '=', seed.entrant_id)

  query =
    seed.stage_id === null || seed.stage_id === undefined
      ? query.where('stage_id', 'is', null)
      : query.where('stage_id', '=', seed.stage_id)

  const existing = await query.executeTakeFirst()

  return (
    existing ?? db.insertInto('standings').values(seed).returningAll().executeTakeFirstOrThrow()
  )
}
