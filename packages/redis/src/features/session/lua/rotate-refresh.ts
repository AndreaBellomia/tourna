import { z } from 'zod'
import source from './rotate-refresh.lua'
import type { LuaScript } from '../../../scripts/runner'

export const rotateRefreshParamsSchema = z.object({
  oldRefreshKey: z.string(),
  keyPrefix: z.string(),
  newSessionId: z.string(),
  newTokenHash: z.string(),
  ttlSeconds: z.number().int().positive(),
  now: z.number().int().positive(),
})

export type RotateRefreshParams = z.infer<typeof rotateRefreshParamsSchema>

export const rotateRefreshResultSchema = z.union([
  z.object({
    status: z.literal('OK'),
    userId: z.string(),
    userAgent: z.string(),
    ip: z.string(),
  }),
  z.object({
    status: z.literal('TOKEN_NOT_FOUND'),
  }),
])

export type RotateRefreshResult = z.infer<typeof rotateRefreshResultSchema>

export const rotateRefreshScript: LuaScript<RotateRefreshParams, RotateRefreshResult> = {
  source,
  buildArgs(params) {
    return {
      keys: [params.oldRefreshKey],
      argv: [
        params.keyPrefix,
        params.newSessionId,
        params.newTokenHash,
        params.ttlSeconds,
        params.now,
      ],
    }
  },
  parseResult: z.string().transform((raw) => rotateRefreshResultSchema.parse(JSON.parse(raw))),
}
