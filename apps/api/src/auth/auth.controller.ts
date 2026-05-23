import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common'
import { Public } from '../common/decorators/public.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { AuthResponse } from '@repo/contracts'
import { AuthResponseDto, LoginDto, RefreshDto, SignupDto } from '@repo/contracts/nest'
import { type JwtPayload } from '@repo/domain'
import { AuthService } from './services/auth.service'
import { ApiOkResponse } from '@nestjs/swagger'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResponseDto })
  signup(
    @Body() dto: SignupDto,
    @Req() req: { headers: Record<string, string>; ip: string },
  ): Promise<AuthResponse> {
    return this.auth.signup(dto, req.headers['user-agent'] ?? '', req.ip)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: AuthResponseDto,
  })
  login(
    @Body() dto: LoginDto,
    @Req() req: { headers: Record<string, string>; ip: string },
  ): Promise<AuthResponse> {
    return this.auth.login(dto, req.headers['user-agent'] ?? '', req.ip)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: AuthResponseDto,
  })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken)
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@CurrentUser() user: JwtPayload) {
    return this.auth.logout(user.sessionId)
  }
}
