import { createZodDto } from 'nestjs-zod'
import { UserListQuerySchema } from './request.schema'

export class UserListQueryDto extends createZodDto(UserListQuerySchema) {}
