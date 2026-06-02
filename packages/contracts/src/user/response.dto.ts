import { createZodDto } from 'nestjs-zod'
import {
  UserDetailResponseSchema,
  UserListResponseSchema,
  UserSummarySchema,
} from './response.schema'

export class UserSummaryDto extends createZodDto(UserSummarySchema) {}

export class UserListResponseDto extends createZodDto(UserListResponseSchema) {}

export class UserDetailResponseDto extends createZodDto(UserDetailResponseSchema) {}
