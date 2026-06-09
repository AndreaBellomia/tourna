import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import type { UserDetailResponse, UserListResponse } from '@repo/contracts'
import { UserDetailResponseDto, UserListQueryDto, UserListResponseDto } from '@repo/contracts/nest'
import { Public } from '~/common/decorators/public.decorator'
import { UserService } from './user.service'
import { ApiCache } from 'src/cache/decorators'

@Public()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserListResponseDto })
  async getUsers(@Query() query: UserListQueryDto): Promise<UserListResponse> {
    return await this.userService.getUsers(query)
  }

  @Get(':id')
  @ApiCache({
    namespace: 'user',
    ttl: 60,
    key: (request) => [request.params?.id ?? ''],
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDetailResponseDto })
  async getUser(@Param('id') id: string): Promise<UserDetailResponse> {
    return await this.userService.getUser(id)
  }
}
