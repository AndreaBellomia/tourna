import { createZodDto } from 'nestjs-zod'
import {
  PresignedReadResponseSchema,
  PresignedUploadResponseSchema,
  StorageObjectResponseSchema,
} from './response.schema'

export class PresignedUploadResponseDto extends createZodDto(PresignedUploadResponseSchema) {}

export class StorageObjectResponseDto extends createZodDto(StorageObjectResponseSchema) {}

export class PresignedReadResponseDto extends createZodDto(PresignedReadResponseSchema) {}
