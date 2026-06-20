import type { Messages } from '../../resources'
import auth from './auth'
import common from './common'
import dashboard from './dashboard'
import loginPage from './login-page'
import metadata from './metadata'
import profile from './profile'
import teams from './teams'
import users from './users'

const messages = {
  metadata,
  common,
  auth,
  loginPage,
  dashboard,
  teams,
  profile,
  users,
} as const satisfies Messages

export default messages
