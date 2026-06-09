import { sql, type Kysely } from 'kysely'

const snowflakeId = sql`generate_snowflake_id()`

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('team_invitations')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('team_id', 'bigint', (c) => c.notNull().references('teams.id').onDelete('cascade'))
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('limited_uses', 'integer')
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

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('team_invitation_uses').execute()
  await db.schema.dropTable('team_invitations').execute()
}
