import type { Kysely } from 'kysely'

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable('users')
    .addColumn('email_verified', 'boolean', (column) => column.notNull().defaultTo(false))
    .execute()
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.alterTable('users').dropColumn('email_verified').execute()
}
