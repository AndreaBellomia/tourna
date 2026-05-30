import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .createType('user_role')
    .asEnum(['admin', 'organizer', 'team_manager', 'player'])
    .execute()

  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(db.fn('gen_random_uuid', [])))
    .addColumn('email', 'text', (c) => c.notNull().unique())
    .addColumn('password_hash', 'text', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(db.fn('now', [])))
    .addColumn('role', sql`user_role`, (c) => c.notNull().defaultTo('player'))
    .execute()

  await db.schema
    .createTable('userSessions')
    .addColumn('sessionId', 'text', (c) => c.primaryKey())
    .addColumn('userId', 'uuid', (c) => c.notNull().references('users.id').onDelete('cascade'))
    .addColumn('expiresAt', 'timestamptz', (c) => c.notNull())
    .addColumn('ip', 'text')
    .addColumn('userAgent', 'text')
    .execute()

  await db.schema
    .createTable('memberships')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(db.fn('gen_random_uuid', [])))
    .addColumn('userId', 'uuid', (c) => c.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role', sql`user_role`, (c) => c.notNull())
    .addColumn('scopeType', 'text', (c) => c.notNull())
    .addColumn('scopeId', 'uuid')
    .execute()

  await db.schema
    .createTable('organizations')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(db.fn('gen_random_uuid', [])))
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('owner_id', 'uuid', (c) => c.notNull().references('users.id').onDelete('cascade'))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(db.fn('now', [])))
    .execute()

  await db.schema
    .createTable('tournaments')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(db.fn('gen_random_uuid', [])))
    .addColumn('organization_id', 'uuid', (c) =>
      c.notNull().references('organizations.id').onDelete('cascade'),
    )
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('type', 'text', (c) => c.notNull())
    .addColumn('status', 'text', (c) => c.notNull().defaultTo('draft'))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(db.fn('now', [])))
    .execute()

  await db.schema
    .createTable('teams')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(db.fn('gen_random_uuid', [])))
    .addColumn('tournament_id', 'uuid', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('seed', 'integer')
    .execute()

  await db.schema
    .createTable('matches')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(db.fn('gen_random_uuid', [])))
    .addColumn('tournament_id', 'uuid', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('round', 'integer', (c) => c.notNull())
    .addColumn('position', 'integer', (c) => c.notNull())
    .addColumn('team_a_id', 'uuid', (c) => c.references('teams.id').onDelete('set null'))
    .addColumn('team_b_id', 'uuid', (c) => c.references('teams.id').onDelete('set null'))
    .addColumn('score_a', 'integer')
    .addColumn('score_b', 'integer')
    .addColumn('winner_id', 'uuid', (c) => c.references('teams.id').onDelete('set null'))
    .addColumn('status', 'text', (c) => c.notNull().defaultTo('pending'))
    .execute()
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropTable('matches').execute()
  await db.schema.dropTable('teams').execute()
  await db.schema.dropTable('tournaments').execute()
  await db.schema.dropTable('organizations').execute()
  await db.schema.dropTable('memberships').execute()
  await db.schema.dropTable('userSessions').execute()
  await db.schema.dropTable('users').execute()
  await db.schema.dropType('user_role').execute()
}
