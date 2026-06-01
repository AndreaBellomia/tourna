import { createZodDto } from 'nestjs-zod'
import {
  CreateTeamRequestSchema,
  TeamListQuerySchema,
  UpdateTeamRequestSchema,
} from './request.schema'

export class CreateTeamDto extends createZodDto(CreateTeamRequestSchema) {}

export class UpdateTeamDto extends createZodDto(UpdateTeamRequestSchema) {}

export class TeamListQueryDto extends createZodDto(TeamListQuerySchema) {}
