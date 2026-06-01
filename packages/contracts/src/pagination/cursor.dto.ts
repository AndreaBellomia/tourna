import { createZodDto } from 'nestjs-zod'
import { CursorPaginationQuerySchema } from './cursor.schema'

export class CursorPaginationQueryDto extends createZodDto(CursorPaginationQuerySchema) {}
