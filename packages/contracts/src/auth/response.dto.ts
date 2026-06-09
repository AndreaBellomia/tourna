import { createZodDto } from 'nestjs-zod'
import { AuthResponseSchema, VerifyEmailResponseSchema } from './response.schema'

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}

export class VerifyEmailResponseDto extends createZodDto(VerifyEmailResponseSchema) {}
