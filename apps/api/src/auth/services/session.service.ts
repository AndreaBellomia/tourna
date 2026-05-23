import { Injectable } from '@nestjs/common'
import { RedisService } from '../../redis/redis.service'

import { AppConfigService } from '../../config/config.service'
import {
  RefreshTokenData,
  RefreshTokenModel,
  SessionData,
  SessionModel,
  UserSessionsIndexModel,
} from '@repo/redis'

export interface CreateSessionParams {
  sessionId: string
  userId: string
  /** SHA-256 hash of the refresh token. */
  tokenHash: string
  userAgent?: string
  ip?: string
}

@Injectable()
export class SessionService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  private get sessionTtl() {
    return this.config.get('SESSION_TTL_SECONDS')
  }

  async createSession(params: CreateSessionParams): Promise<void> {
    const now = Date.now()
    const expiresAt = now + this.sessionTtl * 1000

    const sessionData: SessionData = {
      userId: params.userId,
      tokenHash: params.tokenHash,
      userAgent: params.userAgent,
      ip: params.ip,
      createdAt: now,
      expiresAt,
    }

    await Promise.all([
      this.redis.engine.kv.set(
        { ...SessionModel, ttl: this.sessionTtl },
        sessionData,
        params.sessionId,
      ),
      this.redis.engine.kv.set(
        { ...RefreshTokenModel, ttl: this.sessionTtl },
        { userId: params.userId, sessionId: params.sessionId },
        params.tokenHash,
      ),
      this.redis.engine.zset.zadd(
        UserSessionsIndexModel,
        expiresAt,
        params.sessionId,
        params.userId,
      ),
    ])

    await this.cleanupUserSessions(params.userId)
  }

  async rotateRefreshToken(oldSessionId: string, newParams: CreateSessionParams): Promise<void> {
    const oldSession = await this.redis.engine.kv.get(SessionModel, oldSessionId)

    if (oldSession) {
      await Promise.all([
        this.cleanupUserSessions(oldSession.userId),
        this.redis.engine.kv.delete(RefreshTokenModel, oldSession.tokenHash),
        this.redis.engine.zset.zrem(UserSessionsIndexModel, oldSessionId, oldSession.userId),
        this.redis.engine.kv.delete(SessionModel, oldSessionId),
      ])
    }

    await this.createSession(newParams)
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.redis.engine.kv.get(SessionModel, sessionId)
  }

  async findSessionByRefreshToken(
    tokenHash: string,
  ): Promise<{ sessionId: string; session: SessionData; mapping: RefreshTokenData } | null> {
    const mapping = await this.redis.engine.kv.get(RefreshTokenModel, tokenHash)
    if (!mapping) return null

    const session = await this.redis.engine.kv.get(SessionModel, mapping.sessionId)
    if (!session) {
      await this.redis.engine.kv.delete(RefreshTokenModel, tokenHash)
      return null
    }

    return { sessionId: mapping.sessionId, session, mapping }
  }

  async getUserSessions(userId: string): Promise<Array<{ sessionId: string; data: SessionData }>> {
    await this.cleanupUserSessions(userId)

    const sessionIds = await this.redis.engine.zset.zrange(UserSessionsIndexModel, 0, -1, userId)

    const results: Array<{ sessionId: string; data: SessionData }> = []
    const ghosts: string[] = []

    for (const sessionId of sessionIds) {
      const data = await this.redis.engine.kv.get(SessionModel, sessionId)
      if (data) {
        results.push({ sessionId, data })
      } else {
        ghosts.push(sessionId)
      }
    }

    if (ghosts.length > 0) {
      await Promise.all(
        ghosts.map((id) => this.redis.engine.zset.zrem(UserSessionsIndexModel, id, userId)),
      )
    }

    return results
  }

  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.redis.engine.kv.get(SessionModel, sessionId)

    if (session) {
      await Promise.all([
        this.redis.engine.kv.delete(RefreshTokenModel, session.tokenHash),
        this.redis.engine.zset.zrem(UserSessionsIndexModel, sessionId, session.userId),
        this.redis.engine.kv.delete(SessionModel, sessionId),
      ])
    }
  }

  async cleanupUserSessions(userId: string): Promise<void> {
    await this.redis.engine.zset.zremrangebyscore(
      UserSessionsIndexModel,
      '-inf',
      Date.now(),
      userId,
    )
  }
}
