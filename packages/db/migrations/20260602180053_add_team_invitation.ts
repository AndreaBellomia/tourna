import { sql, type Kysely } from 'kysely'

const snowflakeId = sql`generate_snowflake_id()`

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .createTable('team_invitations')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('team_id', 'bigint', (c) => c.notNull().references('teams.id').onDelete('cascade'))
    .addColumn('code_hash', 'varchar(64)', (c) => c.notNull())
    .addColumn('created_by', 'bigint', (c) =>
      c.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('assigned_to', 'bigint', (c) => c.references('users.id').onDelete('set null'))
    .addColumn('role', 'varchar(32)', (c) => c.notNull())
    .addColumn('max_uses', 'integer')
    .addColumn('used_count', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('status', 'varchar(32)', (c) => c.notNull())
    .execute()

  await db.schema
    .createTable('team_invitation_uses')
    .addColumn('team_invitation_id', 'bigint', (col) =>
      col.notNull().references('team_invitations.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'bigint', (c) => c.notNull().references('users.id').onDelete('cascade'))
    .addPrimaryKeyConstraint('team_invitation_uses_pkey', ['team_invitation_id', 'user_id'])
    .execute()
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropTable('team_invitation_uses').execute()
  await db.schema.dropTable('team_invitations').execute()
}
