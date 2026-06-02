import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema.alterTable('teams').addColumn('tag', 'varchar(4)').execute()
  await db.schema.alterTable('users').addColumn('nickname', 'varchar(40)').execute()

  await sql`
    update teams
    set tag = upper(
      substring(
        coalesce(nullif(regexp_replace(name, '[^a-zA-Z0-9]', '', 'g'), ''), 'TEAM') || 'TEAM'
        from 1 for 4
      )
    )
    where tag is null
  `.execute(db)

  await sql`
    with ranked_users as (
      select
        id,
        lower(
          substring(
            coalesce(nullif(regexp_replace(display_name, '[^a-zA-Z0-9_-]', '', 'g'), ''), 'player')
            from 1 for 28
          )
        ) || '-' || right(id::text, 6) as generated_nickname
      from users
      where nickname is null
    )
    update users
    set nickname = ranked_users.generated_nickname
    from ranked_users
    where users.id = ranked_users.id
  `.execute(db)

  await db.schema
    .alterTable('teams')
    .alterColumn('tag', (c) => c.setNotNull())
    .execute()
  await db.schema
    .alterTable('users')
    .alterColumn('nickname', (c) => c.setNotNull())
    .execute()

  await db.schema
    .createIndex('users_nickname_unique_active_idx')
    .unique()
    .on('users')
    .column(sql`lower(nickname)`)
    .where(sql.ref('deleted_at'), 'is', null)
    .execute()

  await db.schema
    .createIndex('teams_tag_idx')
    .on('teams')
    .column(sql`upper(tag)`)
    .execute()

  await db.schema
    .alterTable('teams')
    .addCheckConstraint('teams_tag_shape_check', sql`tag ~ '^[A-Z0-9]{4}$'`)
    .execute()

  await db.schema
    .alterTable('users')
    .addCheckConstraint('users_nickname_shape_check', sql`nickname ~ '^[a-z0-9][a-z0-9_-]{1,39}$'`)
    .execute()
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.alterTable('users').dropConstraint('users_nickname_shape_check').execute()
  await db.schema.alterTable('teams').dropConstraint('teams_tag_shape_check').execute()
  await db.schema.dropIndex('teams_tag_idx').ifExists().execute()
  await db.schema.dropIndex('users_nickname_unique_active_idx').ifExists().execute()
  await db.schema.alterTable('users').dropColumn('nickname').execute()
  await db.schema.alterTable('teams').dropColumn('tag').execute()
}
