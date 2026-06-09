import type { SeedScenario, SeedStep } from '../framework'
import type { SeedContext } from '../framework/types'
import type { SeedRow } from './db-helpers'
import {
  getOrInsertDiscipline,
  getOrInsertEvent,
  getOrInsertMatch,
  getOrInsertMatchParticipant,
  getOrInsertMembership,
  getOrInsertOrganization,
  getOrInsertScoringProfile,
  getOrInsertStage,
  getOrInsertStanding,
  getOrInsertTag,
  getOrInsertTeam,
  getOrInsertTeamMembership,
  getOrInsertTournament,
  getOrInsertTournamentEntrant,
  getOrInsertTournamentRoster,
  getOrInsertTournamentRosterMember,
  getOrInsertTournamentTag,
  getOrInsertUser,
} from './db-helpers'

export const devSeedScenario: SeedScenario = createTournamentFixtureScenario({
  name: 'dev',
  description:
    'Development fixture with organizations, teams, a tournament, entrants, and matches.',
  prefix: 'dev',
  users: 10,
  teams: 4,
  tags: 3,
})

interface TournamentFixtureScenarioOptions {
  name: 'dev' | 'e2e'
  description: string
  prefix: string
  users: number
  teams: number
  tags: number
}

export function createTournamentFixtureScenario(
  options: TournamentFixtureScenarioOptions,
): SeedScenario {
  const steps: SeedStep[] = [
    {
      name: 'users',
      run: (context) => seedUsers(context, options),
    },
    {
      name: 'organization',
      run: (context) => seedOrganization(context, options),
    },
    {
      name: 'catalog',
      run: (context) => seedCatalog(context, options),
    },
    {
      name: 'teams',
      run: (context) => seedTeams(context, options),
    },
    {
      name: 'tournament',
      run: (context) => seedTournament(context, options),
    },
    {
      name: 'bracket',
      run: seedBracket,
    },
  ]

  return {
    name: options.name,
    description: options.description,
    steps,
  }
}

async function seedUsers(context: SeedContext, options: TournamentFixtureScenarioOptions) {
  const users = []

  for (let index = 0; index < options.users; index += 1) {
    const number = index + 1
    const user = await getOrInsertUser(
      context.db,
      context.factories.user.build({
        email: `${options.prefix}.player-${number}@tourna.test`,
        nickname: `${options.prefix}-player-${number}`,
        display_name: `${title(options.prefix)} Player ${number}`,
      }),
    )
    users.push(user)
  }

  context.state.set(`${options.prefix}.users`, users)
}

async function seedOrganization(context: SeedContext, options: TournamentFixtureScenarioOptions) {
  const users = context.state.get<SeedRow<'users'>[]>(`${options.prefix}.users`)
  const owner = users[0]!

  const organization = await getOrInsertOrganization(
    context.db,
    context.factories.organization.build({
      created_by_user_id: owner.id,
      name: `${title(options.prefix)} Tourna Club`,
      slug: `${options.prefix}-tourna-club`,
    }),
  )

  await getOrInsertMembership(
    context.db,
    context.factories.membership.build({
      user_id: owner.id,
      scope_type: 'organization',
      scope_id: organization.id,
      role_code: 'org_owner',
    }),
  )

  context.state.set(`${options.prefix}.organization`, organization)
}

async function seedCatalog(context: SeedContext, options: TournamentFixtureScenarioOptions) {
  const users = context.state.get<SeedRow<'users'>[]>(`${options.prefix}.users`)
  const organization = context.state.get<SeedRow<'organizations'>>(`${options.prefix}.organization`)

  const discipline = await getOrInsertDiscipline(
    context.db,
    context.factories.discipline.build({
      name: `${title(options.prefix)} Valorant`,
      slug: `${options.prefix}-valorant`,
      kind: 'esport',
    }),
  )
  const event = await getOrInsertEvent(
    context.db,
    context.factories.event.build({
      organization_id: organization.id,
      created_by_user_id: users[0]!.id,
      name: `${title(options.prefix)} Championship Weekend`,
      slug: `${options.prefix}-championship-weekend`,
    }),
  )
  const scoringProfile = await getOrInsertScoringProfile(
    context.db,
    context.factories.scoringProfile.build({
      organization_id: organization.id,
      created_by_user_id: users[0]!.id,
      name: `${title(options.prefix)} Win Loss`,
    }),
  )
  const tags = []

  for (let index = 0; index < options.tags; index += 1) {
    const number = index + 1
    const tag = await getOrInsertTag(
      context.db,
      context.factories.tag.build({
        label: `${title(options.prefix)} Tag ${number}`,
        slug: `${options.prefix}-tag-${number}`,
      }),
    )
    tags.push(tag)
  }

  context.state.set(`${options.prefix}.discipline`, discipline)
  context.state.set(`${options.prefix}.event`, event)
  context.state.set(`${options.prefix}.scoringProfile`, scoringProfile)
  context.state.set(`${options.prefix}.tags`, tags)
}

async function seedTeams(context: SeedContext, options: TournamentFixtureScenarioOptions) {
  const users = context.state.get<SeedRow<'users'>[]>(`${options.prefix}.users`)
  const organization = context.state.get<SeedRow<'organizations'>>(`${options.prefix}.organization`)
  const teams = []

  for (let index = 0; index < options.teams; index += 1) {
    const number = index + 1
    const owner = users[index % users.length]!
    const player = users[(index + options.teams) % users.length]!
    const team = await getOrInsertTeam(
      context.db,
      context.factories.team.build({
        created_by_user_id: owner.id,
        organization_id: organization.id,
        name: `${title(options.prefix)} Team ${number}`,
        slug: `${options.prefix}-team-${number}`,
        tag: `${options.prefix.slice(0, 2).toUpperCase()}${number.toString().padStart(2, '0')}`,
      }),
    )

    await getOrInsertTeamMembership(
      context.db,
      context.factories.teamMembership.build({
        team_id: team.id,
        user_id: owner.id,
        role: 'owner',
      }),
    )
    await getOrInsertTeamMembership(
      context.db,
      context.factories.teamMembership.build({
        team_id: team.id,
        user_id: player.id,
        role: 'player',
      }),
    )

    teams.push(team)
  }

  context.state.set(`${options.prefix}.teams`, teams)
}

async function seedTournament(context: SeedContext, options: TournamentFixtureScenarioOptions) {
  const users = context.state.get<SeedRow<'users'>[]>(`${options.prefix}.users`)
  const organization = context.state.get<SeedRow<'organizations'>>(`${options.prefix}.organization`)
  const event = context.state.get<SeedRow<'events'>>(`${options.prefix}.event`)
  const discipline = context.state.get<SeedRow<'disciplines'>>(`${options.prefix}.discipline`)
  const scoringProfile = context.state.get<SeedRow<'scoring_profiles'>>(
    `${options.prefix}.scoringProfile`,
  )
  const tags = context.state.get<SeedRow<'tags'>[]>(`${options.prefix}.tags`)
  const teams = context.state.get<SeedRow<'teams'>[]>(`${options.prefix}.teams`)

  const tournament = await getOrInsertTournament(
    context.db,
    context.factories.tournament.build({
      organization_id: organization.id,
      event_id: event.id,
      created_by_user_id: users[0]!.id,
      discipline_id: discipline.id,
      scoring_profile_id: scoringProfile.id,
      name: `${title(options.prefix)} Open`,
      slug: `${options.prefix}-open`,
    }),
  )

  for (const tag of tags) {
    await getOrInsertTournamentTag(
      context.db,
      context.factories.tournamentTag.build({
        tournament_id: tournament.id,
        tag_id: tag.id,
      }),
    )
  }

  const entrants = []
  const rosters = []

  for (const [index, team] of teams.entries()) {
    const entrant = await getOrInsertTournamentEntrant(
      context.db,
      context.factories.tournamentEntrant.build({
        tournament_id: tournament.id,
        entrant_type: 'team',
        entrant_id: team.id,
        seed: index + 1,
      }),
    )
    const roster = await getOrInsertTournamentRoster(
      context.db,
      context.factories.tournamentRoster.build({
        tournament_id: tournament.id,
        entrant_id: entrant.id,
        name: `${team.name} Roster`,
      }),
    )
    const members = users.slice(index, index + 2)

    for (const [memberIndex, member] of members.entries()) {
      await getOrInsertTournamentRosterMember(
        context.db,
        context.factories.tournamentRosterMember.build({
          roster_id: roster.id,
          user_id: member.id,
          role: memberIndex === 0 ? 'starter' : 'substitute',
        }),
      )
    }

    entrants.push(entrant)
    rosters.push(roster)
  }

  context.state.set(`${options.prefix}.tournament`, tournament)
  context.state.set(`${options.prefix}.entrants`, entrants)
  context.state.set(`${options.prefix}.rosters`, rosters)
}

async function seedBracket(context: SeedContext) {
  const prefix = context.profile
  const tournament = context.state.get<SeedRow<'tournaments'>>(`${prefix}.tournament`)
  const discipline = context.state.get<SeedRow<'disciplines'>>(`${prefix}.discipline`)
  const entrants = context.state.get<SeedRow<'tournament_entrants'>[]>(`${prefix}.entrants`)

  const stage = await getOrInsertStage(
    context.db,
    context.factories.stage.build({
      tournament_id: tournament.id,
      name: 'Opening Bracket',
      order_index: 1,
    }),
  )
  const matches = []

  for (let index = 0; index < entrants.length; index += 2) {
    const matchEntrants = entrants.slice(index, index + 2)

    if (matchEntrants.length < 2) {
      continue
    }

    const match = await getOrInsertMatch(
      context.db,
      context.factories.match.build({
        tournament_id: tournament.id,
        stage_id: stage.id,
        discipline_id: discipline.id,
        order_index: matches.length + 1,
      }),
    )

    for (const [slotIndex, entrant] of matchEntrants.entries()) {
      await getOrInsertMatchParticipant(
        context.db,
        context.factories.matchParticipant.build({
          match_id: match.id,
          entrant_id: entrant.id,
          slot: slotIndex + 1,
        }),
      )
    }

    matches.push(match)
  }

  for (const [index, entrant] of entrants.entries()) {
    await getOrInsertStanding(
      context.db,
      context.factories.standing.build({
        tournament_id: tournament.id,
        stage_id: stage.id,
        entrant_id: entrant.id,
        rank: index + 1,
      }),
    )
  }

  context.state.set(`${prefix}.stage`, stage)
  context.state.set(`${prefix}.matches`, matches)
}

function title(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`
}
