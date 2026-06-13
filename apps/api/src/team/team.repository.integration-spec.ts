import type { KyselyDatabase } from '@repo/db'
import { createWorkerTestDatabase, type TestDatabaseEnvironment } from '@repo/db/testing'
import { DatabaseService } from '~/database/database.service'
import { TeamRepository } from './team.repository'

describe('TeamRepository integration', () => {
  let environment: TestDatabaseEnvironment
  let db: KyselyDatabase
  let repository: TeamRepository

  beforeAll(async () => {
    environment = await createWorkerTestDatabase({ databasePrefix: 'tourna_api_test' })
    db = environment.db
    repository = new TeamRepository(createDatabaseService(db))
  }, 30_000)

  beforeEach(async () => {
    await environment.reset()
  })

  afterAll(async () => {
    await environment?.destroy()
  })

  it('creates a team and owner membership through real constraints and queries', async () => {
    const owner = await insertUser(db, {
      email: 'owner@example.com',
      displayName: 'Owner Player',
      nickname: 'owner_player',
    })

    const team = await repository.createTeam(
      owner.id,
      'Atlas Wolves',
      'atls',
      'Competitive squad',
      'public',
    )

    expect(team).toMatchObject({
      name: 'Atlas Wolves',
      slug: 'atlas-wolves',
      tag: 'ATLS',
      visibility: 'public',
      viewerMembership: {
        role: 'owner',
        canManage: true,
      },
    })
    expect(team).not.toBeNull()

    if (!team) {
      throw new Error('Expected created team')
    }

    const [member] = team.members

    expect(team.members).toHaveLength(1)
    expect(member?.role).toBe('owner')
    expect(typeof member?.joinedAt).toBe('string')
    expect(member?.user).toEqual({
      id: owner.id,
      display_name: 'Owner Player',
      nickname: 'owner_player',
      avatarObjectKey: null,
    })

    const membership = await db
      .selectFrom('team_memberships')
      .select(['team_id', 'user_id', 'role', 'status'])
      .where('team_id', '=', team.id)
      .executeTakeFirstOrThrow()

    expect(membership).toEqual({
      team_id: team.id,
      user_id: owner.id,
      role: 'owner',
      status: 'active',
    })
  })

  it('lists public teams with search filters and cursor pagination', async () => {
    const owner = await insertUser(db, {
      email: 'creator@example.com',
      displayName: 'Creator',
      nickname: 'creator',
    })

    await insertTeam(db, {
      ownerId: owner.id,
      name: 'Atlas Alpha',
      slug: 'atlas-alpha',
      tag: 'ATLA',
      visibility: 'public',
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
    })
    await insertTeam(db, {
      ownerId: owner.id,
      name: 'Atlas Beta',
      slug: 'atlas-beta',
      tag: 'ATLB',
      visibility: 'public',
      createdAt: new Date('2026-06-02T10:00:00.000Z'),
    })
    await insertTeam(db, {
      ownerId: owner.id,
      name: 'Atlas Private',
      slug: 'atlas-private',
      tag: 'ATLP',
      visibility: 'private',
      createdAt: new Date('2026-06-03T10:00:00.000Z'),
    })
    await insertTeam(db, {
      ownerId: owner.id,
      name: 'Nova Squad',
      slug: 'nova-squad',
      tag: 'NOVA',
      visibility: 'public',
      createdAt: new Date('2026-06-04T10:00:00.000Z'),
    })

    const firstPage = await repository.listTeams({
      filters: { search: 'atlas', visibility: 'public' },
      pagination: { limit: 1, direction: 'next' },
    })

    expect(firstPage.data.map((team) => team.slug)).toEqual(['atlas-beta'])
    expect(firstPage.pageInfo.hasNextPage).toBe(true)
    expect(firstPage.pageInfo.nextCursor).toEqual(expect.any(String))

    const secondPage = await repository.listTeams({
      filters: { search: 'atlas', visibility: 'public' },
      pagination: {
        limit: 1,
        direction: 'next',
        cursor: firstPage.pageInfo.nextCursor ?? undefined,
      },
    })

    expect(secondPage.data.map((team) => team.slug)).toEqual(['atlas-alpha'])
    expect(secondPage.pageInfo.hasNextPage).toBe(false)
  })
})

function createDatabaseService(db: KyselyDatabase) {
  return new DatabaseService({
    db,
    destroy: () => undefined,
  })
}

async function insertUser(
  db: KyselyDatabase,
  input: { email: string; displayName: string; nickname: string },
) {
  return await db
    .insertInto('users')
    .values({
      email: input.email,
      display_name: input.displayName,
      nickname: input.nickname,
      password_hash: 'hashed-password',
    })
    .returning(['id'])
    .executeTakeFirstOrThrow()
}

async function insertTeam(
  db: KyselyDatabase,
  input: {
    ownerId: string
    name: string
    slug: string
    tag: string
    visibility: 'private' | 'public' | 'unlisted'
    createdAt: Date
  },
) {
  return await db
    .insertInto('teams')
    .values({
      created_by_user_id: input.ownerId,
      name: input.name,
      slug: input.slug,
      tag: input.tag,
      status: 'published',
      visibility: input.visibility,
      created_at: input.createdAt,
      updated_at: input.createdAt,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow()
}
