import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator'
import { JwtPayload, jwtPayloadSchema } from '@repo/domain'

type HeaderValue = string | string[] | undefined
type RequestWithUser = {
  headers: Record<string, HeaderValue>
  user?: JwtPayload
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) return true

    const req = context.switchToHttp().getRequest<RequestWithUser>()
    const token = this.extractToken(req)

    if (!token) throw new UnauthorizedException()

    try {
      const raw = this.jwt.verify<JwtPayload>(token)
      req.user = jwtPayloadSchema.parse(raw)
      return true
    } catch {
      throw new UnauthorizedException()
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
