import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createIndex('teams_created_at_id_seek_idx')
    .on('teams')
    .columns(['created_at', 'id'])
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex('teams_created_at_id_seek_idx').ifExists().execute()
}
