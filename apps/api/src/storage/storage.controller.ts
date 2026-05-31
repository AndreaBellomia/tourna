import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import {
  CreatePresignedUploadDto,
  FinalizeUploadDto,
  PresignedUploadResponseDto,
  StorageObjectResponseDto,
} from '@repo/contracts/nest'
import type { PresignedUploadResponse, StorageObjectResponse } from '@repo/contracts'
import { StorageService } from './storage.service'

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('uploads/presign')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PresignedUploadResponseDto })
  createPresignedUpload(@Body() dto: CreatePresignedUploadDto): Promise<PresignedUploadResponse> {
    return this.storage.createPresignedUpload(dto)
  }

  @Post('uploads/finalize')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StorageObjectResponseDto })
  finalizeUpload(@Body() dto: FinalizeUploadDto): Promise<StorageObjectResponse> {
    return this.storage.finalizeUpload(dto.uploadId)
  }
}
