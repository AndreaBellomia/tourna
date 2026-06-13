import type { KyselyDatabase } from '@repo/db'
import { createWorkerTestDatabase, type TestDatabaseEnvironment } from '@repo/db/testing'
import { DatabaseService } from '~/database/database.service'
import { ProfileRepository } from './profile.repository'

describe('ProfileRepository integration', () => {
  let environment: TestDatabaseEnvironment
  let db: KyselyDatabase
  let repository: ProfileRepository

  beforeAll(async () => {
    environment = await createWorkerTestDatabase({ databasePrefix: 'tourna_api_test' })
    db = environment.db
    repository = new ProfileRepository(createDatabaseService(db))
  }, 30_000)

  beforeEach(async () => {
    await environment.reset()
  })

  afterAll(async () => {
    await environment?.destroy()
  })

  it('returns the active profile with database-backed field mapping', async () => {
    const user = await insertUser(db, {
      email: 'andrea@example.com',
      displayName: 'Andrea',
      nickname: 'andrea',
      bio: 'Tournament organizer',
      avatarObjectKey: 'public/avatar/users/2026/06/user-1/avatar.png',
      emailVerified: true,
    })

    await expect(repository.getProfile(user.id)).resolves.toEqual({
      id: user.id,
      email: 'andrea@example.com',
      display_name: 'Andrea',
      nickname: 'andrea',
      bio: 'Tournament organizer',
      avatarObjectKey: 'public/avatar/users/2026/06/user-1/avatar.png',
      emailVerified: true,
    })
  })

  it('updates nullable profile fields and ignores soft-deleted users', async () => {
    const activeUser = await insertUser(db, {
      email: 'active@example.com',
      displayName: 'Active User',
      nickname: 'active_user',
      bio: 'Old bio',
      avatarObjectKey: 'public/avatar/users/2026/06/active/avatar.png',
    })
    const deletedUser = await insertUser(db, {
      email: 'deleted@example.com',
      displayName: 'Deleted User',
      nickname: 'deleted_user',
    })

    await db
      .updateTable('users')
      .set({ deleted_at: new Date('2026-06-03T10:00:00.000Z') })
      .where('id', '=', deletedUser.id)
      .execute()

    await expect(
      repository.updateProfile(activeUser.id, {
        display_name: 'Active Captain',
        bio: '',
        avatarObjectKey: null,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: activeUser.id,
        display_name: 'Active Captain',
        bio: null,
        avatarObjectKey: null,
      }),
    )

    await expect(
      repository.updateProfile(deletedUser.id, {
        display_name: 'Should Not Update',
      }),
    ).resolves.toBeNull()
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
  input: {
    email: string
    displayName: string
    nickname: string
    bio?: string
    avatarObjectKey?: string
    emailVerified?: boolean
  },
) {
  return await db
    .insertInto('users')
    .values({
      email: input.email,
      display_name: input.displayName,
      nickname: input.nickname,
      bio: input.bio ?? null,
      avatar_object_key: input.avatarObjectKey ?? null,
      email_verified: input.emailVerified,
      password_hash: 'hashed-password',
    })
    .returning(['id'])
    .executeTakeFirstOrThrow()
}
