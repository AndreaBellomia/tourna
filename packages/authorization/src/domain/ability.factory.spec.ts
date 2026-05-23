import { subject } from '@casl/ability'
import { Action, Subject } from './permissions'
import { buildAbility } from './ability.factory'

describe('buildAbility', () => {
  it('grants full access to admin memberships', () => {
    const ability = buildAbility([
      {
        id: 'm-1',
        userId: 'u-1',
        role: 'admin',
        scopeType: 'global',
        scopeId: undefined,
      },
    ])

    expect(ability.can(Action.Manage, Subject.Tournament)).toBe(true)
    expect(ability.can(Action.Manage, Subject.Billing)).toBe(true)
  })

  it('grants scoped organizer permissions', () => {
    const ability = buildAbility([
      {
        id: 'm-1',
        userId: 'u-1',
        role: 'organizer',
        scopeType: 'tournament',
        scopeId: 'tour-1',
      },
    ])

    expect(ability.can(Action.Manage, subject(Subject.Tournament, { id: 'tour-1' }))).toBe(true)
    expect(ability.can(Action.Manage, subject(Subject.Tournament, { id: 'tour-2' }))).toBe(false)
    expect(
      ability.can(Action.Manage, subject(Subject.Team, { tournamentId: 'tour-1' })),
    ).toBe(true)
  })

  it('grants scoped team manager permissions', () => {
    const ability = buildAbility([
      {
        id: 'm-1',
        userId: 'u-1',
        role: 'team_manager',
        scopeType: 'team',
        scopeId: 'team-1',
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
        userId: 'u-1',
        role: 'player',
        scopeType: 'team',
        scopeId: 'team-1',
      },
    ])

    expect(ability.can(Action.Read, subject(Subject.Match, { teamId: 'team-1' }))).toBe(true)
    expect(ability.can(Action.Read, subject(Subject.Match, { teamId: 'team-2' }))).toBe(false)
  })
})
