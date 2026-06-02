import type { Kysely } from 'kysely'

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema.alterTable('teams').addColumn('logo_object_key', 'text').execute()
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.alterTable('teams').dropColumn('logo_object_key').execute()
}
