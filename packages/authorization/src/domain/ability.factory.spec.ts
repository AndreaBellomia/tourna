import { subject } from '@casl/ability'
import { Action, Subject } from './permissions'
import { buildAbility } from './ability.factory'

describe('buildAbility', () => {
  it('grants full access to admin memberships', () => {
    const ability = buildAbility([
      {
        id: 'm-1',
        user_id: 'u-1',
        role_code: 'global_admin',
        scope_type: 'global',
        scope_id: null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

    expect(ability.can(Action.Manage, Subject.Tournament)).toBe(true)
    expect(ability.can(Action.Manage, Subject.Billing)).toBe(true)
  })

  it('grants scoped organizer permissions', () => {
    const ability = buildAbility([
      {
        id: 'm-1',
        user_id: 'u-1',
        role_code: 'org_admin',
        scope_type: 'organization',
        scope_id: 'org-1',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

    expect(
      ability.can(Action.Manage, subject(Subject.Tournament, { organizationId: 'org-1' })),
    ).toBe(true)
    expect(
      ability.can(Action.Manage, subject(Subject.Tournament, { organizationId: 'org-2' })),
    ).toBe(false)
    expect(ability.can(Action.Manage, subject(Subject.Team, { organizationId: 'org-1' }))).toBe(
      true,
    )
  })

  it('grants scoped team manager permissions', () => {
    const ability = buildAbility([
      {
        id: 'm-1',
        user_id: 'u-1',
        role_code: 'team_captain',
        scope_type: 'team',
        scope_id: 'team-1',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

    expect(ability.can(Action.Update, subject(Subject.Team, { id: 'team-1' }))).toBe(true)
    expect(ability.can(Action.Update, subject(Subject.Team, { id: 'team-2' }))).toBe(false)
    expect(ability.can(Action.Invite, subject(Subject.User, { teamId: 'team-1' }))).toBe(true)
  })

  it('grants player read access only for its own team matches', () => {
    const ability = buildAbility([
      {
        id: 'm-1',
        user_id: 'u-1',
        role_code: 'player',
        scope_type: 'team',
        scope_id: 'team-1',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

    expect(ability.can(Action.Read, subject(Subject.Match, { teamId: 'team-1' }))).toBe(true)
    expect(ability.can(Action.Read, subject(Subject.Match, { teamId: 'team-2' }))).toBe(false)
  })
})
