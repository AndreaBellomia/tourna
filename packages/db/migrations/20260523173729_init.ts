import { sql, type Kysely, type SqlBool } from 'kysely'

const enumValues = (values: readonly string[]) => sql.raw(values.map((v) => `'${v}'`).join(', '))
const jsonObject = sql`'{}'::jsonb`
const snowflakeId = sql`generate_snowflake_id()`
const now = sql`now()`

const membershipScopes = ['global', 'organization', 'team', 'event', 'tournament'] as const
const membershipRoleCodes = [
  'global_admin',
  'org_owner',
  'org_admin',
  'org_moderator',
  'team_owner',
  'team_captain',
  'player',
  'coach',
  'manager',
] as const
const membershipStatuses = ['active', 'invited', 'suspended', 'left', 'removed'] as const
const lifecycleStatuses = [
  'draft',
  'published',
  'registration_open',
  'live',
  'completed',
  'cancelled',
  'archived',
] as const
const visibilityLevels = ['private', 'unlisted', 'public'] as const
const organizationTypes = ['community', 'company', 'club', 'organizer'] as const
const eventTypes = ['championship', 'festival', 'league_season', 'circuit', 'showcase'] as const
const disciplineKinds = ['esport', 'sport', 'sim_racing', 'board_game', 'other'] as const
const tournamentTypes = [
  'tournament',
  'league',
  'scrim',
  'friendly',
  'qualifier',
  'championship',
] as const
const participantModes = ['team', 'individual'] as const
const tournamentFormats = ['single_elimination', 'round_robin', 'points_league', 'scrim'] as const
const evidencePolicies = ['none', 'optional', 'required'] as const
const entrantTypes = ['team', 'user'] as const
const entrantStatuses = [
  'invited',
  'registered',
  'checked_in',
  'active',
  'eliminated',
  'withdrawn',
] as const
const rosterStatuses = ['draft', 'submitted', 'approved', 'locked', 'rejected'] as const
const teamMembershipRoles = [
  'owner',
  'captain',
  'player',
  'substitute',
  'coach',
  'manager',
] as const
const rosterMemberRoles = ['starter', 'substitute', 'coach', 'manager'] as const
const lineupMemberRoles = ['player', 'substitute', 'coach'] as const
const stageTypes = ['bracket', 'group', 'round', 'leaderboard', 'scrim_session'] as const
const matchTypes = ['match', 'race', 'heat', 'fixture'] as const
const matchStatuses = [
  'scheduled',
  'live',
  'pending_confirmation',
  'disputed',
  'completed',
  'cancelled',
] as const
const participantResultStatuses = ['pending', 'confirmed', 'disputed'] as const
const scoringModes = ['win_loss', 'placement_points', 'points_league', 'hybrid'] as const
const scoreAwardSourceTypes = [
  'match_result',
  'manual_bonus',
  'penalty',
  'admin_adjustment',
] as const
const resultSubmitterTypes = ['admin', 'entrant'] as const
const resultSubmissionStatuses = ['pending', 'confirmed', 'disputed', 'rejected'] as const
const resultConfirmationStatuses = ['confirmed', 'disputed'] as const
const evidenceTypes = ['screenshot', 'video', 'link', 'file'] as const
const statValueTypes = ['integer', 'decimal', 'duration', 'boolean', 'text'] as const
const constraintScopes = ['event', 'tournament', 'registration'] as const
const constraintTypes = [
  'platform_only',
  'region_only',
  'invite_only',
  'min_rank',
  'max_rank',
  'age_limit',
  'custom',
] as const

export async function up(db: Kysely<never>): Promise<void> {
  await sql`
    create sequence tourna_snowflake_sequence
      as bigint
      minvalue 0
      maxvalue 4095
      cycle
  `.execute(db)

  await sql`
    create or replace function generate_snowflake_id()
    returns bigint
    language plpgsql
    as $$
    declare
      custom_epoch_ms constant bigint := 1704067200000;
      timestamp_ms bigint;
      worker_id bigint;
      sequence_id bigint;
      worker_setting text;
    begin
      worker_setting := current_setting('tourna.snowflake_worker_id', true);
      worker_id := coalesce(nullif(worker_setting, '')::bigint, 0);

      if worker_id < 0 or worker_id > 1023 then
        raise exception 'tourna.snowflake_worker_id must be between 0 and 1023';
      end if;

      timestamp_ms := floor(extract(epoch from clock_timestamp()) * 1000)::bigint - custom_epoch_ms;

      if timestamp_ms < 0 then
        raise exception 'system clock is before the Tourna snowflake epoch';
      end if;

      sequence_id := nextval('tourna_snowflake_sequence') % 4096;

      return (timestamp_ms << 22) | (worker_id << 12) | sequence_id;
    end;
    $$;
  `.execute(db)

  await sql`
    create or replace function set_updated_at()
    returns trigger
    language plpgsql
    as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$;
  `.execute(db)

  await db.schema
    .createTable('users')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('email', 'text', (c) => c.notNull())
    .addColumn('display_name', 'varchar(80)', (c) => c.notNull())
    .addColumn('password_hash', 'text', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('deleted_at', 'timestamptz')
    .addCheckConstraint('users_email_shape_check', sql`position('@' in email) > 1`)
    .addCheckConstraint(
      'users_display_name_length_check',
      sql`char_length(display_name) between 2 and 80`,
    )
    .execute()

  await db.schema
    .createIndex('users_email_unique_active_idx')
    .unique()
    .on('users')
    .column(sql`lower(email)`)
    .where(sql.ref('deleted_at'), 'is', null)
    .execute()

  await db.schema
    .createTable('memberships')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('user_id', 'bigint', (c) => c.notNull().references('users.id').onDelete('cascade'))
    .addColumn('scope_type', 'text', (c) =>
      c.notNull().check(sql`scope_type in (${enumValues(membershipScopes)})`),
    )
    .addColumn('scope_id', 'bigint')
    .addColumn('role_code', 'text', (c) =>
      c.notNull().check(sql`role_code in (${enumValues(membershipRoleCodes)})`),
    )
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('active')
        .check(sql`status in (${enumValues(membershipStatuses)})`),
    )
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint(
      'memberships_global_scope_check',
      sql`(scope_type = 'global' and scope_id is null) or (scope_type <> 'global' and scope_id is not null)`,
    )
    .execute()

  await db.schema
    .createIndex('memberships_user_scope_role_unique_idx')
    .unique()
    .on('memberships')
    .column('user_id')
    .column('scope_type')
    .column(sql`coalesce(scope_id, 0::bigint)`)
    .column('role_code')
    .execute()

  await db.schema
    .createTable('organizations')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('created_by_user_id', 'bigint', (c) =>
      c.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('name', 'varchar(120)', (c) => c.notNull())
    .addColumn('slug', 'varchar(120)', (c) => c.notNull())
    .addColumn('type', 'text', (c) =>
      c.notNull().check(sql`type in (${enumValues(organizationTypes)})`),
    )
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('draft')
        .check(sql`status in (${enumValues(lifecycleStatuses)})`),
    )
    .addColumn('visibility', 'text', (c) =>
      c
        .notNull()
        .defaultTo('private')
        .check(sql`visibility in (${enumValues(visibilityLevels)})`),
    )
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('organizations_name_length_check', sql`char_length(name) between 2 and 120`)
    .addCheckConstraint('organizations_slug_shape_check', sql`slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`)
    .execute()

  await db.schema
    .createIndex('organizations_slug_unique_idx')
    .unique()
    .on('organizations')
    .column('slug')
    .execute()

  await db.schema
    .createTable('events')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('organization_id', 'bigint', (c) =>
      c.references('organizations.id').onDelete('set null'),
    )
    .addColumn('created_by_user_id', 'bigint', (c) =>
      c.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('name', 'varchar(160)', (c) => c.notNull())
    .addColumn('slug', 'varchar(160)', (c) => c.notNull())
    .addColumn('description', 'text')
    .addColumn('type', 'text', (c) => c.notNull().check(sql`type in (${enumValues(eventTypes)})`))
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('draft')
        .check(sql`status in (${enumValues(lifecycleStatuses)})`),
    )
    .addColumn('visibility', 'text', (c) =>
      c
        .notNull()
        .defaultTo('private')
        .check(sql`visibility in (${enumValues(visibilityLevels)})`),
    )
    .addColumn('starts_at', 'timestamptz')
    .addColumn('ends_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('events_name_length_check', sql`char_length(name) between 2 and 160`)
    .addCheckConstraint('events_slug_shape_check', sql`slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`)
    .addCheckConstraint(
      'events_date_order_check',
      sql`ends_at is null or starts_at is null or ends_at >= starts_at`,
    )
    .execute()

  await db.schema
    .createIndex('events_owner_slug_unique_idx')
    .unique()
    .on('events')
    .column(sql`coalesce(organization_id, 0::bigint)`)
    .column('slug')
    .execute()

  await db.schema
    .createTable('disciplines')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('name', 'varchar(120)', (c) => c.notNull())
    .addColumn('slug', 'varchar(120)', (c) => c.notNull())
    .addColumn('kind', 'text', (c) =>
      c.notNull().check(sql`kind in (${enumValues(disciplineKinds)})`),
    )
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('disciplines_name_length_check', sql`char_length(name) between 2 and 120`)
    .addCheckConstraint('disciplines_slug_shape_check', sql`slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`)
    .execute()

  await db.schema
    .createIndex('disciplines_slug_unique_idx')
    .unique()
    .on('disciplines')
    .column('slug')
    .execute()

  await db.schema
    .createTable('tags')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('label', 'varchar(80)', (c) => c.notNull())
    .addColumn('slug', 'varchar(80)', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('tags_label_length_check', sql`char_length(label) between 2 and 80`)
    .addCheckConstraint('tags_slug_shape_check', sql`slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`)
    .execute()

  await db.schema.createIndex('tags_slug_unique_idx').unique().on('tags').column('slug').execute()

  await db.schema
    .createTable('teams')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('created_by_user_id', 'bigint', (c) =>
      c.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('organization_id', 'bigint', (c) =>
      c.references('organizations.id').onDelete('set null'),
    )
    .addColumn('name', 'varchar(120)', (c) => c.notNull())
    .addColumn('slug', 'varchar(120)', (c) => c.notNull())
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('draft')
        .check(sql`status in (${enumValues(lifecycleStatuses)})`),
    )
    .addColumn('visibility', 'text', (c) =>
      c
        .notNull()
        .defaultTo('private')
        .check(sql`visibility in (${enumValues(visibilityLevels)})`),
    )
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('teams_name_length_check', sql`char_length(name) between 2 and 120`)
    .addCheckConstraint('teams_slug_shape_check', sql`slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`)
    .execute()

  await db.schema
    .createIndex('teams_owner_slug_unique_idx')
    .unique()
    .on('teams')
    .column(sql`coalesce(organization_id, 0::bigint)`)
    .column('slug')
    .execute()

  await db.schema
    .createTable('team_memberships')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('team_id', 'bigint', (c) => c.notNull().references('teams.id').onDelete('cascade'))
    .addColumn('user_id', 'bigint', (c) => c.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role', 'text', (c) =>
      c.notNull().check(sql`role in (${enumValues(teamMembershipRoles)})`),
    )
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('active')
        .check(sql`status in (${enumValues(membershipStatuses)})`),
    )
    .addColumn('joined_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('left_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint(
      'team_memberships_left_after_join_check',
      sql`left_at is null or left_at >= joined_at`,
    )
    .execute()

  await db.schema
    .createIndex('team_memberships_active_user_unique_idx')
    .unique()
    .on('team_memberships')
    .columns(['team_id', 'user_id'])
    .where(sql<SqlBool>`left_at is null and status in ('active', 'invited')`)
    .execute()

  await db.schema
    .createTable('scoring_profiles')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('organization_id', 'bigint', (c) =>
      c.references('organizations.id').onDelete('set null'),
    )
    .addColumn('created_by_user_id', 'bigint', (c) =>
      c.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('name', 'varchar(120)', (c) => c.notNull())
    .addColumn('mode', 'text', (c) => c.notNull().check(sql`mode in (${enumValues(scoringModes)})`))
    .addColumn('config', 'jsonb', (c) => c.notNull().defaultTo(jsonObject))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint(
      'scoring_profiles_name_length_check',
      sql`char_length(name) between 2 and 120`,
    )
    .addCheckConstraint(
      'scoring_profiles_config_object_check',
      sql`jsonb_typeof(config) = 'object'`,
    )
    .execute()

  await db.schema
    .createTable('tournaments')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('organization_id', 'bigint', (c) =>
      c.references('organizations.id').onDelete('set null'),
    )
    .addColumn('event_id', 'bigint', (c) => c.references('events.id').onDelete('set null'))
    .addColumn('created_by_user_id', 'bigint', (c) =>
      c.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('discipline_id', 'bigint', (c) =>
      c.notNull().references('disciplines.id').onDelete('restrict'),
    )
    .addColumn('scoring_profile_id', 'bigint', (c) =>
      c.references('scoring_profiles.id').onDelete('set null'),
    )
    .addColumn('name', 'varchar(160)', (c) => c.notNull())
    .addColumn('slug', 'varchar(160)', (c) => c.notNull())
    .addColumn('description', 'text')
    .addColumn('type', 'text', (c) =>
      c.notNull().check(sql`type in (${enumValues(tournamentTypes)})`),
    )
    .addColumn('participant_mode', 'text', (c) =>
      c.notNull().check(sql`participant_mode in (${enumValues(participantModes)})`),
    )
    .addColumn('format', 'text', (c) =>
      c.notNull().check(sql`format in (${enumValues(tournamentFormats)})`),
    )
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('draft')
        .check(sql`status in (${enumValues(lifecycleStatuses)})`),
    )
    .addColumn('visibility', 'text', (c) =>
      c
        .notNull()
        .defaultTo('private')
        .check(sql`visibility in (${enumValues(visibilityLevels)})`),
    )
    .addColumn('evidence_policy', 'text', (c) =>
      c
        .notNull()
        .defaultTo('optional')
        .check(sql`evidence_policy in (${enumValues(evidencePolicies)})`),
    )
    .addColumn('settings', 'jsonb', (c) => c.notNull().defaultTo(jsonObject))
    .addColumn('starts_at', 'timestamptz')
    .addColumn('ends_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('tournaments_name_length_check', sql`char_length(name) between 2 and 160`)
    .addCheckConstraint('tournaments_slug_shape_check', sql`slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`)
    .addCheckConstraint(
      'tournaments_date_order_check',
      sql`ends_at is null or starts_at is null or ends_at >= starts_at`,
    )
    .addCheckConstraint('tournaments_settings_object_check', sql`jsonb_typeof(settings) = 'object'`)
    .execute()

  await db.schema
    .createIndex('tournaments_owner_slug_unique_idx')
    .unique()
    .on('tournaments')
    .column(sql`coalesce(organization_id, 0::bigint)`)
    .column(sql`coalesce(event_id, 0::bigint)`)
    .column('slug')
    .execute()

  await db.schema
    .createTable('tournament_tags')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('tournament_id', 'bigint', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('tag_id', 'bigint', (c) => c.notNull().references('tags.id').onDelete('restrict'))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addUniqueConstraint('tournament_tags_tournament_tag_unique', ['tournament_id', 'tag_id'])
    .execute()

  await db.schema
    .createTable('scope_constraints')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('scope_type', 'text', (c) =>
      c.notNull().check(sql`scope_type in (${enumValues(constraintScopes)})`),
    )
    .addColumn('scope_id', 'bigint', (c) => c.notNull())
    .addColumn('type', 'text', (c) =>
      c.notNull().check(sql`type in (${enumValues(constraintTypes)})`),
    )
    .addColumn('config', 'jsonb', (c) => c.notNull().defaultTo(jsonObject))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint(
      'scope_constraints_config_object_check',
      sql`jsonb_typeof(config) = 'object'`,
    )
    .execute()

  await db.schema
    .createIndex('scope_constraints_scope_idx')
    .on('scope_constraints')
    .columns(['scope_type', 'scope_id'])
    .execute()

  await db.schema
    .createTable('tournament_entrants')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('tournament_id', 'bigint', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('entrant_type', 'text', (c) =>
      c.notNull().check(sql`entrant_type in (${enumValues(entrantTypes)})`),
    )
    .addColumn('entrant_id', 'bigint', (c) => c.notNull())
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('registered')
        .check(sql`status in (${enumValues(entrantStatuses)})`),
    )
    .addColumn('seed', 'integer')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('tournament_entrants_seed_positive_check', sql`seed is null or seed > 0`)
    .addUniqueConstraint('tournament_entrants_unique', [
      'tournament_id',
      'entrant_type',
      'entrant_id',
    ])
    .execute()

  await db.schema
    .createTable('tournament_rosters')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('tournament_id', 'bigint', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('entrant_id', 'bigint', (c) =>
      c.notNull().references('tournament_entrants.id').onDelete('cascade'),
    )
    .addColumn('name', 'varchar(120)')
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('draft')
        .check(sql`status in (${enumValues(rosterStatuses)})`),
    )
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint(
      'tournament_rosters_name_length_check',
      sql`name is null or char_length(name) between 2 and 120`,
    )
    .addUniqueConstraint('tournament_rosters_entrant_unique', ['tournament_id', 'entrant_id'])
    .execute()

  await db.schema
    .createTable('tournament_roster_members')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('roster_id', 'bigint', (c) =>
      c.notNull().references('tournament_rosters.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'bigint', (c) => c.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role', 'text', (c) =>
      c.notNull().check(sql`role in (${enumValues(rosterMemberRoles)})`),
    )
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('active')
        .check(sql`status in (${enumValues(membershipStatuses)})`),
    )
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addUniqueConstraint('tournament_roster_members_roster_user_unique', ['roster_id', 'user_id'])
    .execute()

  await db.schema
    .createTable('stages')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('tournament_id', 'bigint', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('name', 'varchar(120)', (c) => c.notNull())
    .addColumn('type', 'text', (c) => c.notNull().check(sql`type in (${enumValues(stageTypes)})`))
    .addColumn('order_index', 'integer', (c) => c.notNull())
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('draft')
        .check(sql`status in (${enumValues(lifecycleStatuses)})`),
    )
    .addColumn('settings', 'jsonb', (c) => c.notNull().defaultTo(jsonObject))
    .addColumn('starts_at', 'timestamptz')
    .addColumn('ends_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('stages_name_length_check', sql`char_length(name) between 2 and 120`)
    .addCheckConstraint('stages_order_positive_check', sql`order_index > 0`)
    .addCheckConstraint(
      'stages_date_order_check',
      sql`ends_at is null or starts_at is null or ends_at >= starts_at`,
    )
    .addCheckConstraint('stages_settings_object_check', sql`jsonb_typeof(settings) = 'object'`)
    .addUniqueConstraint('stages_tournament_order_unique', ['tournament_id', 'order_index'])
    .execute()

  await db.schema
    .createTable('matches')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('tournament_id', 'bigint', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('stage_id', 'bigint', (c) => c.references('stages.id').onDelete('set null'))
    .addColumn('discipline_id', 'bigint', (c) =>
      c.references('disciplines.id').onDelete('restrict'),
    )
    .addColumn('type', 'text', (c) =>
      c
        .notNull()
        .defaultTo('match')
        .check(sql`type in (${enumValues(matchTypes)})`),
    )
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('scheduled')
        .check(sql`status in (${enumValues(matchStatuses)})`),
    )
    .addColumn('order_index', 'integer')
    .addColumn('scheduled_at', 'timestamptz')
    .addColumn('started_at', 'timestamptz')
    .addColumn('completed_at', 'timestamptz')
    .addColumn('metadata', 'jsonb', (c) => c.notNull().defaultTo(jsonObject))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('matches_order_positive_check', sql`order_index is null or order_index > 0`)
    .addCheckConstraint(
      'matches_time_order_check',
      sql`(completed_at is null or started_at is null or completed_at >= started_at) and (started_at is null or scheduled_at is null or started_at >= scheduled_at)`,
    )
    .addCheckConstraint('matches_metadata_object_check', sql`jsonb_typeof(metadata) = 'object'`)
    .execute()

  await db.schema
    .createIndex('matches_tournament_stage_idx')
    .on('matches')
    .columns(['tournament_id', 'stage_id'])
    .execute()

  await db.schema
    .createTable('match_participants')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('match_id', 'bigint', (c) =>
      c.notNull().references('matches.id').onDelete('cascade'),
    )
    .addColumn('entrant_id', 'bigint', (c) =>
      c.notNull().references('tournament_entrants.id').onDelete('cascade'),
    )
    .addColumn('slot', 'integer', (c) => c.notNull())
    .addColumn('score', 'numeric(12, 3)')
    .addColumn('placement', 'integer')
    .addColumn('is_winner', 'boolean', (c) => c.notNull().defaultTo(false))
    .addColumn('result_status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('pending')
        .check(sql`result_status in (${enumValues(participantResultStatuses)})`),
    )
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('match_participants_slot_positive_check', sql`slot > 0`)
    .addCheckConstraint(
      'match_participants_score_nonnegative_check',
      sql`score is null or score >= 0`,
    )
    .addCheckConstraint(
      'match_participants_placement_positive_check',
      sql`placement is null or placement > 0`,
    )
    .addUniqueConstraint('match_participants_match_entrant_unique', ['match_id', 'entrant_id'])
    .addUniqueConstraint('match_participants_match_slot_unique', ['match_id', 'slot'])
    .execute()

  await db.schema
    .createTable('match_lineups')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('match_id', 'bigint', (c) =>
      c.notNull().references('matches.id').onDelete('cascade'),
    )
    .addColumn('entrant_id', 'bigint', (c) =>
      c.notNull().references('tournament_entrants.id').onDelete('cascade'),
    )
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addUniqueConstraint('match_lineups_match_entrant_unique', ['match_id', 'entrant_id'])
    .execute()

  await db.schema
    .createTable('match_lineup_members')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('lineup_id', 'bigint', (c) =>
      c.notNull().references('match_lineups.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'bigint', (c) => c.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role', 'text', (c) =>
      c.notNull().check(sql`role in (${enumValues(lineupMemberRoles)})`),
    )
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addUniqueConstraint('match_lineup_members_lineup_user_unique', ['lineup_id', 'user_id'])
    .execute()

  await db.schema
    .createTable('result_submissions')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('match_id', 'bigint', (c) =>
      c.notNull().references('matches.id').onDelete('cascade'),
    )
    .addColumn('submitted_by_user_id', 'bigint', (c) =>
      c.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('submitted_by_type', 'text', (c) =>
      c.notNull().check(sql`submitted_by_type in (${enumValues(resultSubmitterTypes)})`),
    )
    .addColumn('entrant_id', 'bigint', (c) =>
      c.references('tournament_entrants.id').onDelete('set null'),
    )
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('pending')
        .check(sql`status in (${enumValues(resultSubmissionStatuses)})`),
    )
    .addColumn('payload', 'jsonb', (c) => c.notNull().defaultTo(jsonObject))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint(
      'result_submissions_payload_object_check',
      sql`jsonb_typeof(payload) = 'object'`,
    )
    .addCheckConstraint(
      'result_submissions_entrant_submitter_check',
      sql`submitted_by_type <> 'entrant' or entrant_id is not null`,
    )
    .execute()

  await db.schema
    .createTable('result_confirmations')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('submission_id', 'bigint', (c) =>
      c.notNull().references('result_submissions.id').onDelete('cascade'),
    )
    .addColumn('entrant_id', 'bigint', (c) =>
      c.notNull().references('tournament_entrants.id').onDelete('cascade'),
    )
    .addColumn('confirmed_by_user_id', 'bigint', (c) =>
      c.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('status', 'text', (c) =>
      c.notNull().check(sql`status in (${enumValues(resultConfirmationStatuses)})`),
    )
    .addColumn('note', 'text')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addUniqueConstraint('result_confirmations_submission_entrant_unique', [
      'submission_id',
      'entrant_id',
    ])
    .execute()

  await db.schema
    .createTable('result_evidence')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('submission_id', 'bigint', (c) =>
      c.notNull().references('result_submissions.id').onDelete('cascade'),
    )
    .addColumn('uploaded_by_user_id', 'bigint', (c) =>
      c.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('type', 'text', (c) =>
      c.notNull().check(sql`type in (${enumValues(evidenceTypes)})`),
    )
    .addColumn('url', 'text', (c) => c.notNull())
    .addColumn('metadata', 'jsonb', (c) => c.notNull().defaultTo(jsonObject))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint(
      'result_evidence_url_length_check',
      sql`char_length(url) between 1 and 2048`,
    )
    .addCheckConstraint(
      'result_evidence_metadata_object_check',
      sql`jsonb_typeof(metadata) = 'object'`,
    )
    .execute()

  await db.schema
    .createTable('score_awards')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('tournament_id', 'bigint', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('match_id', 'bigint', (c) => c.references('matches.id').onDelete('set null'))
    .addColumn('entrant_id', 'bigint', (c) =>
      c.notNull().references('tournament_entrants.id').onDelete('cascade'),
    )
    .addColumn('source_type', 'text', (c) =>
      c.notNull().check(sql`source_type in (${enumValues(scoreAwardSourceTypes)})`),
    )
    .addColumn('points', 'numeric(12, 3)', (c) => c.notNull())
    .addColumn('reason', 'text')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .execute()

  await db.schema
    .createIndex('score_awards_tournament_entrant_idx')
    .on('score_awards')
    .columns(['tournament_id', 'entrant_id'])
    .execute()

  await db.schema
    .createTable('standings')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('tournament_id', 'bigint', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('stage_id', 'bigint', (c) => c.references('stages.id').onDelete('cascade'))
    .addColumn('entrant_id', 'bigint', (c) =>
      c.notNull().references('tournament_entrants.id').onDelete('cascade'),
    )
    .addColumn('points', 'numeric(12, 3)', (c) => c.notNull().defaultTo(0))
    .addColumn('wins', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('draws', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('losses', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('played', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('rank', 'integer')
    .addColumn('tiebreakers', 'jsonb', (c) => c.notNull().defaultTo(jsonObject))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint(
      'standings_counts_nonnegative_check',
      sql`wins >= 0 and draws >= 0 and losses >= 0 and played >= 0`,
    )
    .addCheckConstraint('standings_rank_positive_check', sql`rank is null or rank > 0`)
    .addCheckConstraint(
      'standings_tiebreakers_object_check',
      sql`jsonb_typeof(tiebreakers) = 'object'`,
    )
    .execute()

  await db.schema
    .createIndex('standings_scope_entrant_unique_idx')
    .unique()
    .on('standings')
    .column('tournament_id')
    .column(sql`coalesce(stage_id, 0::bigint)`)
    .column('entrant_id')
    .execute()

  await db.schema
    .createTable('stat_definitions')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('discipline_id', 'bigint', (c) => c.references('disciplines.id').onDelete('cascade'))
    .addColumn('code', 'varchar(80)', (c) => c.notNull())
    .addColumn('name', 'varchar(120)', (c) => c.notNull())
    .addColumn('description', 'text')
    .addColumn('value_type', 'text', (c) =>
      c.notNull().check(sql`value_type in (${enumValues(statValueTypes)})`),
    )
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint('stat_definitions_code_shape_check', sql`code ~ '^[a-z0-9_]+$'`)
    .addCheckConstraint(
      'stat_definitions_name_length_check',
      sql`char_length(name) between 2 and 120`,
    )
    .execute()

  await db.schema
    .createIndex('stat_definitions_discipline_code_unique_idx')
    .unique()
    .on('stat_definitions')
    .column(sql`coalesce(discipline_id, 0::bigint)`)
    .column('code')
    .execute()

  await db.schema
    .createTable('stat_events')
    .addColumn('id', 'bigint', (c) => c.primaryKey().defaultTo(snowflakeId))
    .addColumn('tournament_id', 'bigint', (c) =>
      c.notNull().references('tournaments.id').onDelete('cascade'),
    )
    .addColumn('match_id', 'bigint', (c) =>
      c.notNull().references('matches.id').onDelete('cascade'),
    )
    .addColumn('entrant_id', 'bigint', (c) =>
      c.notNull().references('tournament_entrants.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'bigint', (c) => c.references('users.id').onDelete('set null'))
    .addColumn('stat_definition_id', 'bigint', (c) =>
      c.notNull().references('stat_definitions.id').onDelete('restrict'),
    )
    .addColumn('numeric_value', 'numeric(18, 6)')
    .addColumn('text_value', 'text')
    .addColumn('boolean_value', 'boolean')
    .addColumn('duration_ms', 'integer')
    .addColumn('metadata', 'jsonb', (c) => c.notNull().defaultTo(jsonObject))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(now))
    .addCheckConstraint(
      'stat_events_exactly_one_value_check',
      sql`num_nonnulls(numeric_value, text_value, boolean_value, duration_ms) = 1`,
    )
    .addCheckConstraint(
      'stat_events_duration_positive_check',
      sql`duration_ms is null or duration_ms >= 0`,
    )
    .addCheckConstraint('stat_events_metadata_object_check', sql`jsonb_typeof(metadata) = 'object'`)
    .execute()

  const updatedAtTables = [
    'users',
    'memberships',
    'organizations',
    'events',
    'disciplines',
    'tags',
    'teams',
    'team_memberships',
    'scoring_profiles',
    'tournaments',
    'tournament_tags',
    'scope_constraints',
    'tournament_entrants',
    'tournament_rosters',
    'tournament_roster_members',
    'stages',
    'matches',
    'match_participants',
    'match_lineups',
    'match_lineup_members',
    'result_submissions',
    'result_confirmations',
    'result_evidence',
    'score_awards',
    'standings',
    'stat_definitions',
    'stat_events',
  ] as const

  for (const table of updatedAtTables) {
    await sql
      .raw(
        `
      create trigger ${table}_set_updated_at
      before update on ${table}
      for each row
      execute function set_updated_at()
    `,
      )
      .execute(db)
  }
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropTable('stat_events').ifExists().cascade().execute()
  await db.schema.dropTable('stat_definitions').ifExists().cascade().execute()
  await db.schema.dropTable('standings').ifExists().cascade().execute()
  await db.schema.dropTable('score_awards').ifExists().cascade().execute()
  await db.schema.dropTable('result_evidence').ifExists().cascade().execute()
  await db.schema.dropTable('result_confirmations').ifExists().cascade().execute()
  await db.schema.dropTable('result_submissions').ifExists().cascade().execute()
  await db.schema.dropTable('match_lineup_members').ifExists().cascade().execute()
  await db.schema.dropTable('match_lineups').ifExists().cascade().execute()
  await db.schema.dropTable('match_participants').ifExists().cascade().execute()
  await db.schema.dropTable('matches').ifExists().cascade().execute()
  await db.schema.dropTable('stages').ifExists().cascade().execute()
  await db.schema.dropTable('tournament_roster_members').ifExists().cascade().execute()
  await db.schema.dropTable('tournament_rosters').ifExists().cascade().execute()
  await db.schema.dropTable('tournament_entrants').ifExists().cascade().execute()
  await db.schema.dropTable('scope_constraints').ifExists().cascade().execute()
  await db.schema.dropTable('tournament_tags').ifExists().cascade().execute()
  await db.schema.dropTable('tournaments').ifExists().cascade().execute()
  await db.schema.dropTable('scoring_profiles').ifExists().cascade().execute()
  await db.schema.dropTable('team_memberships').ifExists().cascade().execute()
  await db.schema.dropTable('teams').ifExists().cascade().execute()
  await db.schema.dropTable('tags').ifExists().cascade().execute()
  await db.schema.dropTable('disciplines').ifExists().cascade().execute()
  await db.schema.dropTable('events').ifExists().cascade().execute()
  await db.schema.dropTable('organizations').ifExists().cascade().execute()
  await db.schema.dropTable('memberships').ifExists().cascade().execute()
  await db.schema.dropTable('users').ifExists().cascade().execute()
  await sql`drop function if exists set_updated_at() cascade`.execute(db)
  await sql`drop function if exists generate_snowflake_id() cascade`.execute(db)
  await sql`drop sequence if exists tourna_snowflake_sequence`.execute(db)
}
