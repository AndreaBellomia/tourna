import { z } from 'zod'
import source from './revoke-session.lua'
import type { LuaScript } from '../../../scripts/runner'

export const revokeSessionParamsSchema = z.object({
  sessionKey: z.string(),
  keyPrefix: z.string(),
  sessionId: z.string(),
})

export type RevokeSessionParams = z.infer<typeof revokeSessionParamsSchema>

export const revokeSessionResultSchema = z.union([z.literal(0), z.literal(1)])
export type RevokeSessionResult = z.infer<typeof revokeSessionResultSchema>

export const revokeSessionScript: LuaScript<RevokeSessionParams, RevokeSessionResult> = {
  source,
  buildArgs(params) {
    return {
      keys: [params.sessionKey],
      argv: [params.keyPrefix, params.sessionId],
    }
  },
  parseResult: revokeSessionResultSchema,
}
