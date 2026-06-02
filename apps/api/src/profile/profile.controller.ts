import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import type { UpdateProfileInput } from '@repo/contracts'
import { ProfileSummaryResponseDto, UpdateProfileDto } from '@repo/contracts/nest'
import type { JwtPayload } from '@repo/domain'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { ProfileService } from './profile.service'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileSummaryResponseDto })
  async getProfile(@CurrentUser() user: JwtPayload): Promise<ProfileSummaryResponseDto> {
    return await this.profileService.getProfile(user.userId)
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileSummaryResponseDto })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateProfileDto,
  ): Promise<ProfileSummaryResponseDto> {
    return await this.profileService.updateProfile(user.userId, body as UpdateProfileInput)
  }
}
