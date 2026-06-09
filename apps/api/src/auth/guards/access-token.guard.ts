import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { IS_PUBLIC_KEY } from '~/common/decorators/public.decorator'
import { JwtPayload, jwtPayloadSchema } from '@repo/domain'

type HeaderValue = string | string[] | undefined
type RequestWithUser = {
  headers: Record<string, HeaderValue>
  user?: JwtPayload
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly logger = new Logger(AccessTokenGuard.name)

  constructor(
    private jwt: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const req = context.switchToHttp().getRequest<RequestWithUser>()
    const token = this.extractToken(req)

    if (!token) {
      if (isPublic) return true
      this.logger.warn('Protected request rejected because the access token is missing')
      throw new UnauthorizedException({
        message: 'Access token is missing',
        code: 'AUTH_ACCESS_TOKEN_MISSING',
      })
    }

    try {
      const raw = this.jwt.verify<JwtPayload>(token)
      req.user = jwtPayloadSchema.parse(raw)
      return true
    } catch {
      if (isPublic) {
        this.logger.debug(
          'Public request continued without viewer context after invalid access token',
        )
        return true
      }
      this.logger.warn('Protected request rejected because the access token is invalid or expired')
      throw new UnauthorizedException({
        message: 'Access token is invalid or expired',
        code: 'AUTH_ACCESS_TOKEN_INVALID',
      })
    }
  }

  private extractToken(req: RequestWithUser): string | null {
    const auth = req.headers['authorization']
    if (!auth) return null

    const normalized = Array.isArray(auth) ? auth[0] : auth
    if (!normalized) return null

    const [type, token] = normalized.split(' ')
    if (type !== 'Bearer' || !token) return null

    return token
  }
}
