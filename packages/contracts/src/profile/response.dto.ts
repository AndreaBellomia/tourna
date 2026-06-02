import { createZodDto } from 'nestjs-zod'
import { ProfileSummaryResponseSchema } from './response.schema'

export class ProfileSummaryResponseDto extends createZodDto(ProfileSummaryResponseSchema) {}
