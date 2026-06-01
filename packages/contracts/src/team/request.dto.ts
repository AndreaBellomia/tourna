import { createZodDto } from 'nestjs-zod'
import { CreateTeamRequestSchema, TeamListQuerySchema } from './request.schema'

export class CreateTeamDto extends createZodDto(CreateTeamRequestSchema) {}

export class TeamListQueryDto extends createZodDto(TeamListQuerySchema) {}
