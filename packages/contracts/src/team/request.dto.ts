import { createZodDto } from 'nestjs-zod'
import {
  CreateTeamRequestSchema,
  TeamInvitationRequestSchema,
  TeamListQuerySchema,
  TeamRemoveUserRequestSchema,
  UpdateTeamRequestSchema,
} from './request.schema'

export class CreateTeamDto extends createZodDto(CreateTeamRequestSchema) {}

export class UpdateTeamDto extends createZodDto(UpdateTeamRequestSchema) {}

export class TeamListQueryDto extends createZodDto(TeamListQuerySchema) {}

export class TeamInvitationDto extends createZodDto(TeamInvitationRequestSchema) {}

export class TeamRemoveUserDto extends createZodDto(TeamRemoveUserRequestSchema) {}
