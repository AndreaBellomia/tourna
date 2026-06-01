import { ApiError } from './api-error'

export class TeamNotFoundError extends ApiError {
  constructor(teamId: string) {
    super(404, `Team "${teamId}" not found`, 'TEAM_NOT_FOUND')
  }
}
