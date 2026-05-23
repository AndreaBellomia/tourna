import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayload } from '@repo/domain'

type RequestWithUser = {
  user?: JwtPayload
}

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<RequestWithUser>()
  return req.user
})
