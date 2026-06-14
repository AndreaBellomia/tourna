import { createZodDto } from 'nestjs-zod'
import {
  TeamInvitationAcceptResponseSchema,
  TeamInvitationResponseSchema,
  TeamDetailResponseSchema,
  TeamListResponseSchema,
  TeamSummarySchema,
  TeamViewerMembershipSchema,
} from './response.schema'

export class TeamSummaryDto extends createZodDto(TeamSummarySchema) {}

export class TeamViewerMembershipDto extends createZodDto(TeamViewerMembershipSchema) {}

export class TeamListResponseDto extends createZodDto(TeamListResponseSchema) {}

export class TeamDetailResponseDto extends createZodDto(TeamDetailResponseSchema) {}

export class TeamInvitationResponseDto extends createZodDto(TeamInvitationResponseSchema) {}

export class TeamInvitationAcceptResponseDto extends createZodDto(
  TeamInvitationAcceptResponseSchema,
) {}
