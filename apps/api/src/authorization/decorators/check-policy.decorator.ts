import { SetMetadata } from '@nestjs/common'
import { Action, Subject } from '@repo/authorization'

export const CHECK_POLICY = 'check_policy'

export const CheckPolicy = (action: Action, subject: Subject) =>
  SetMetadata(CHECK_POLICY, {
    action,
    subject,
  })
