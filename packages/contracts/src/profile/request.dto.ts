import { createZodDto } from 'nestjs-zod'
import { UpdateProfileRequestSchema } from './request.schema'

export class UpdateProfileDto extends createZodDto(UpdateProfileRequestSchema) {}
