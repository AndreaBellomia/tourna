import { z } from 'zod'
import source from './get-user-sessions.lua'
import type { LuaScript } from '../../../scripts/runner'
import type { SessionData } from '../session.model'

export const getUserSessionsParamsSchema = z.object({
  userIdxKey: z.string(),
  now: z.number().int(),
  keyPrefix: z.string(),
})

export type GetUserSessionsParams = z.infer<typeof getUserSessionsParamsSchema>

const sessionDataSchema = z.object({
  userId: z.string(),
  tokenHash: z.string(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  createdAt: z.number(),
  expiresAt: z.number(),
})

const userSessionEntrySchema = z.object({
  sessionId: z.string(),
  data: sessionDataSchema,
})

export type UserSessionEntry = { sessionId: string; data: SessionData }

const getUserSessionsResultSchema = z.array(userSessionEntrySchema)
export type GetUserSessionsResult = UserSessionEntry[]

export const getUserSessionsScript: LuaScript<GetUserSessionsParams, GetUserSessionsResult> = {
  source,
  buildArgs(params) {
    return {
      keys: [params.userIdxKey],
      argv: [params.now, params.keyPrefix],
    }
  },
  parseResult: z
    .string()
    .transform((raw) =>
      getUserSessionsResultSchema.parse(JSON.parse(raw)),
    ) as unknown as z.ZodType<GetUserSessionsResult>,
}
