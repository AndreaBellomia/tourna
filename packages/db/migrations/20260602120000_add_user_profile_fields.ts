import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable('users')
    .addColumn('bio', 'text')
    .addColumn('avatar_object_key', 'text')
    .execute()

  await db.schema
    .createIndex('users_public_profile_search_idx')
    .on('users')
    .expression(sql`lower(display_name)`)
    .where(sql.ref('deleted_at'), 'is', null)
    .execute()
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropIndex('users_public_profile_search_idx').ifExists().execute()

  await db.schema.alterTable('users').dropColumn('avatar_object_key').dropColumn('bio').execute()
}
