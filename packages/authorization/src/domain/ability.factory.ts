import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import type { Selectable } from 'kysely'
import type { DatabaseSchema } from '@repo/db'

export function buildAbility(memberships: Selectable<DatabaseSchema['memberships']>[]) {
  const { can, build } = new AbilityBuilder(createMongoAbility)

  for (const m of memberships) {
    switch (m.role_code as DatabaseSchema['memberships']['role_code']) {
      case 'global_admin':
        can('manage', 'all')
        break

      case 'org_owner':
      case 'org_admin':
        can('manage', 'Tournament', {
          organizationId: m.scope_id,
        })

        can('manage', 'Team', {
          organizationId: m.scope_id,
        })

        can('manage', 'Match', {
          organizationId: m.scope_id,
        })
        break

      case 'org_moderator':
        can('manage', 'Tournament', {
          organizationId: m.scope_id,
        })

        can('manage', 'Team', {
          organizationId: m.scope_id,
        })

        can('manage', 'Match', {
          organizationId: m.scope_id,
        })
        break

      case 'team_owner':
      case 'team_captain':
      case 'manager':
        can('update', 'Team', {
          id: m.scope_id,
        })

        can('invite', 'User', {
          teamId: m.scope_id,
        })
        break

      case 'player':
        can('read', 'Match', {
          teamId: m.scope_id,
        })
        break

      case 'coach':
        can('read', 'Team', {
          id: m.scope_id,
        })

        can('read', 'Match', {
          teamId: m.scope_id,
        })
        break
    }
  }

  return build()
}
