import { RedisClient } from '../../client/redis.client'
import { rawBuildKey } from '../../core/redis.keys'
import { RedisScriptRunner } from '../../scripts/runner'
import { SessionModel } from './session.model'
import { RefreshTokenModel } from './refresh-token.model'
import { UserSessionsIndexModel } from './session.model'
import { createSessionScript } from './lua/create-session'
import { rotateRefreshScript, type RotateRefreshResult } from './lua/rotate-refresh'
import { revokeSessionScript } from './lua/revoke-session'
import {
  getUserSessionsScript,
  type GetUserSessionsResult,
  type UserSessionEntry,
} from './lua/get-user-sessions'
import type { SessionData } from './session.model'
import type { RefreshTokenData } from './refresh-token.model'

export interface CreateSessionInput {
  sessionId: string
  userId: string
  tokenHash: string
  userAgent?: string
  ip?: string
  ttlSeconds: number
}

export interface RotateRefreshInput {
  oldTokenHash: string
  newSessionId: string
  newTokenHash: string
  ttlSeconds: number
}

export type { RotateRefreshResult }
export type { GetUserSessionsResult, UserSessionEntry }

const KEY_PREFIX = rawBuildKey(SessionModel.namespace, `v${SessionModel.version}`)

function sessionKey(sessionId: string): string {
  return rawBuildKey(KEY_PREFIX, ...SessionModel.key(sessionId))
}

function refreshKey(tokenHash: string): string {
  return rawBuildKey(KEY_PREFIX, ...RefreshTokenModel.key(tokenHash))
}

function userIndexKey(userId: string): string {
  return rawBuildKey(KEY_PREFIX, ...UserSessionsIndexModel.key(userId))
}

/**
 * Typed interface over the session Lua scripts.
 *
 * Instantiate with a raw ioredis client — scripts are registered once
 * and executed via EVALSHA with automatic EVAL fallback.
 */
export class SessionScripts {
  private readonly runner: RedisScriptRunner

  constructor(client: RedisClient) {
    this.runner = new RedisScriptRunner(client)
    this.runner.registerScript('createSession', createSessionScript)
    this.runner.registerScript('rotateRefresh', rotateRefreshScript)
    this.runner.registerScript('revokeSession', revokeSessionScript)
    this.runner.registerScript('getUserSessions', getUserSessionsScript)
  }

  async createSession(params: CreateSessionInput): Promise<void> {
    const now = Date.now()
    const expiresAt = now + params.ttlSeconds * 1000

    const sessionData: SessionData = {
      userId: params.userId,
      tokenHash: params.tokenHash,
      userAgent: params.userAgent,
      ip: params.ip,
      createdAt: now,
      expiresAt,
    }

    const refreshData: RefreshTokenData = {
      userId: params.userId,
      sessionId: params.sessionId,
    }

    await this.runner.run('createSession', createSessionScript, {
      sessionKey: sessionKey(params.sessionId),
      refreshKey: refreshKey(params.tokenHash),
      userIdxKey: userIndexKey(params.userId),
      sessionJson: JSON.stringify(sessionData),
      refreshJson: JSON.stringify(refreshData),
      ttlSeconds: params.ttlSeconds,
      expiresAt,
      sessionId: params.sessionId,
      now,
    })
  }

  async rotateRefreshToken(params: RotateRefreshInput): Promise<RotateRefreshResult> {
    return this.runner.run('rotateRefresh', rotateRefreshScript, {
      oldRefreshKey: refreshKey(params.oldTokenHash),
      keyPrefix: KEY_PREFIX,
      newSessionId: params.newSessionId,
      newTokenHash: params.newTokenHash,
      ttlSeconds: params.ttlSeconds,
      now: Date.now(),
    })
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    const result = await this.runner.run('revokeSession', revokeSessionScript, {
      sessionKey: sessionKey(sessionId),
      keyPrefix: KEY_PREFIX,
      sessionId,
    })

    return result === 1
  }

  async getUserSessions(userId: string): Promise<GetUserSessionsResult> {
    return this.runner.run('getUserSessions', getUserSessionsScript, {
      userIdxKey: userIndexKey(userId),
      now: Date.now(),
      keyPrefix: KEY_PREFIX,
    })
  }
}
