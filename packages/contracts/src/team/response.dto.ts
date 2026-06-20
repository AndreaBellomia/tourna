import { createZodDto } from 'nestjs-zod'
import {
  TeamInvitationAcceptResponseSchema,
  TeamInvitationCreateResponseSchema,
  TeamDetailResponseSchema,
  TeamListResponseSchema,
  TeamSummarySchema,
  TeamViewerMembershipSchema,
  TeamInvitationResponseSchema,
  TeamInvitationListResponseSchema,
} from './response.schema'

export class TeamSummaryDto extends createZodDto(TeamSummarySchema) {}

export class TeamViewerMembershipDto extends createZodDto(TeamViewerMembershipSchema) {}

export class TeamListResponseDto extends createZodDto(TeamListResponseSchema) {}

export class TeamDetailResponseDto extends createZodDto(TeamDetailResponseSchema) {}

export class TeamInvitationCreateResponseDto extends createZodDto(
  TeamInvitationCreateResponseSchema,
) {}

export class TeamInvitationResponseDto extends createZodDto(TeamInvitationResponseSchema) {}

export class TeamInvitationListResponseDto extends createZodDto(TeamInvitationListResponseSchema) {}

export class TeamInvitationAcceptResponseDto extends createZodDto(
  TeamInvitationAcceptResponseSchema,
) {}
