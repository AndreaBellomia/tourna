import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import type { Selectable } from 'kysely'
import type { DatabaseSchema } from '@repo/db'

export function buildAbility(memberships: Selectable<DatabaseSchema['memberships']>[]) {
  const { can, build } = new AbilityBuilder(createMongoAbility)

  for (const m of memberships) {
    switch (m.role as DatabaseSchema['memberships']['role']) {
      case 'admin':
        can('manage', 'all')
        break

      case 'organizer':
        can('manage', 'Tournament', {
          id: m.scopeId,
        })

        can('manage', 'Team', {
          tournamentId: m.scopeId,
        })

        can('manage', 'Match', {
          tournamentId: m.scopeId,
        })
        break

      case 'team_manager':
        can('update', 'Team', {
          id: m.scopeId,
        })

        can('invite', 'User', {
          teamId: m.scopeId,
        })
        break

      case 'player':
        can('read', 'Match', {
          teamId: m.scopeId,
        })
        break
    }
  }

  return build()
}
