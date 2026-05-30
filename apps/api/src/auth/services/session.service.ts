import { Injectable } from '@nestjs/common'
import { RedisService } from '../../redis/redis.service'

import { AppConfigService } from '../../config/config.service'
import {
  SessionData,
  SessionModel,
  SessionScripts,
  type RotateRefreshResult,
  type UserSessionEntry,
} from '@repo/redis'

export interface CreateSessionParams {
  sessionId: string
  userId: string
  /** SHA-256 hash of the refresh token. */
  tokenHash: string
  userAgent?: string
  ip?: string
}

export interface RotateRefreshParams {
  oldTokenHash: string
  newSessionId: string
  newTokenHash: string
}

@Injectable()
export class SessionService {
  private readonly scripts: SessionScripts

  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {
    this.scripts = new SessionScripts(redis.getClient())
  }

  private get sessionTtl() {
    return this.config.get('SESSION_TTL_SECONDS')
  }

  async createSession(params: CreateSessionParams): Promise<void> {
    await this.scripts.createSession({
      ...params,
      ttlSeconds: this.sessionTtl,
    })
  }

  async rotateRefreshToken(params: RotateRefreshParams): Promise<RotateRefreshResult> {
    return this.scripts.rotateRefreshToken({
      ...params,
      ttlSeconds: this.sessionTtl,
    })
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.scripts.revokeSession(sessionId)
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.redis.engine.kv.get(SessionModel, sessionId)
  }

  async getUserSessions(userId: string): Promise<UserSessionEntry[]> {
    return this.scripts.getUserSessions(userId)
  }
}
