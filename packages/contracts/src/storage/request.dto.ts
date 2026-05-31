import { createZodDto } from 'nestjs-zod'
import {
  CreatePresignedReadSchema,
  CreatePresignedUploadSchema,
  FinalizeUploadSchema,
} from './request.schema'

export class CreatePresignedUploadDto extends createZodDto(CreatePresignedUploadSchema) {}

export class FinalizeUploadDto extends createZodDto(FinalizeUploadSchema) {}

export class CreatePresignedReadDto extends createZodDto(CreatePresignedReadSchema) {}
