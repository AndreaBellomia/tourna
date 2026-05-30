import { z } from 'zod'
import source from './create-session.lua'
import type { LuaScript } from '../../../scripts/runner'

export const createSessionParamsSchema = z.object({
  sessionKey: z.string(),
  refreshKey: z.string(),
  userIdxKey: z.string(),
  sessionJson: z.string(),
  refreshJson: z.string(),
  ttlSeconds: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  sessionId: z.string(),
  now: z.number().int().positive(),
})

export type CreateSessionParams = z.infer<typeof createSessionParamsSchema>

export const createSessionResultSchema = z.literal(1)
export type CreateSessionResult = z.infer<typeof createSessionResultSchema>

export const createSessionScript: LuaScript<CreateSessionParams, CreateSessionResult> = {
  source,
  buildArgs(params) {
    return {
      keys: [params.sessionKey, params.refreshKey, params.userIdxKey],
      argv: [
        params.sessionJson,
        params.refreshJson,
        params.ttlSeconds,
        params.expiresAt,
        params.sessionId,
        params.now,
      ],
    }
  },
  parseResult: createSessionResultSchema,
}
