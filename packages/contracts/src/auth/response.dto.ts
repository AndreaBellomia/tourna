import { createZodDto } from 'nestjs-zod'
import { AuthResponseSchema } from './response.schema'

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}
