import { MembershipTable } from './schemas/membership'
import { UserTable } from './schemas/user'
import { UserSessionTable } from './schemas/userSessions'

export interface DatabaseSchema {
  users: UserTable
  userSessions: UserSessionTable
  memberships: MembershipTable
}
