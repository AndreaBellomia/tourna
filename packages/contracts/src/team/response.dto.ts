import { createZodDto } from 'nestjs-zod'
import {
  TeamDetailResponseSchema,
  TeamListResponseSchema,
  TeamSummarySchema,
} from './response.schema'

export class TeamSummaryDto extends createZodDto(TeamSummarySchema) {}

export class TeamListResponseDto extends createZodDto(TeamListResponseSchema) {}

export class TeamDetailResponseDto extends createZodDto(TeamDetailResponseSchema) {}
