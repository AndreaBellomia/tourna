import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common'
import { Public } from '~/common/decorators/public.decorator'
import { CurrentUser } from '~/common/decorators/current-user.decorator'
import { AuthResponse, VerifyEmailResponse } from '@repo/contracts'
import {
  AuthResponseDto,
  LoginDto,
  RefreshDto,
  SignupDto,
  VerifyEmailDto,
  VerifyEmailResponseDto,
} from '@repo/contracts/nest'
import { type JwtPayload } from '@repo/domain'
import { AuthService } from './services/auth.service'
import { ApiOkResponse } from '@nestjs/swagger'
import { EmailVerificationService } from './services/email-verification.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResponseDto })
  async signup(
    @Body() dto: SignupDto,
    @Req() req: { headers: Record<string, string>; ip: string },
  ): Promise<AuthResponse> {
    return await this.auth.signup(dto, req.headers['user-agent'] ?? '', req.ip)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: AuthResponseDto,
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: { headers: Record<string, string>; ip: string },
  ): Promise<AuthResponse> {
    return await this.auth.login(dto, req.headers['user-agent'] ?? '', req.ip)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: AuthResponseDto,
  })
  async refresh(@Body() dto: RefreshDto) {
    return await this.auth.refresh(dto.refreshToken)
  }

  @Public()
  @Post('email-verification/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: VerifyEmailResponseDto })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<VerifyEmailResponse> {
    return await this.emailVerification.verifyEmail(dto.token)
  }

  @Post('email-verification/resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendEmailVerification(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.emailVerification.sendVerificationEmailForUser(user.userId)
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: JwtPayload) {
    return await this.auth.logout(user.sessionId)
  }
}
