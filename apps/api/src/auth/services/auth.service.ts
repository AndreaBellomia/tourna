import { Injectable, UnauthorizedException } from '@nestjs/common'
import { scrypt, randomBytes, timingSafeEqual, randomUUID } from 'crypto'
import { promisify } from 'util'
import { AuthResponse, LoginInput, SignupInput } from '@repo/contracts'
import { JwtPayload } from '@repo/domain'
import { DatabaseService } from '../../database/database.service'
import { TokenService } from '../../tokens/token.service'
import { SessionService } from './session.service'
import { AppConfigService } from '../../config/config.service'

const scryptAsync = promisify(scrypt)

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tokens: TokenService,
    private readonly sessions: SessionService,
    private readonly config: AppConfigService,
  ) {}

  async signup(dto: SignupInput, userAgent: string, ip: string): Promise<AuthResponse> {
    const existing = await this.db.db
      .selectFrom('users')
      .select('id')
      .where('email', '=', dto.email)
      .executeTakeFirst()

    if (existing) throw new UnauthorizedException('Email already in use')

    const passwordHash = await this.hashPassword(dto.password)
    const displayName = this.buildDefaultDisplayName(dto.email)
    const nickname = await this.buildAvailableNickname(displayName)

    const [user] = await this.db.db
      .insertInto('users')
      .values({
        email: dto.email,
        display_name: displayName,
        nickname,
        password_hash: passwordHash,
      })
      .returning(['id'])
      .execute()

    if (!user) throw new Error('User creation failed')

    return this.buildSession(user.id, userAgent, ip)
  }

  async login(dto: LoginInput, userAgent: string, ip: string): Promise<AuthResponse> {
    const user = await this.db.db
      .selectFrom('users')
      .select(['id', 'email', 'password_hash'])
      .where('email', '=', dto.email)
      .executeTakeFirst()

    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await this.verifyPassword(dto.password, user.password_hash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    return this.buildSession(user.id, userAgent, ip)
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const oldTokenHash = this.tokens.hashToken(refreshToken)

    const newSessionId = randomUUID()
    const newRefreshToken = this.tokens.generateRefreshToken()
    const newTokenHash = this.tokens.hashToken(newRefreshToken)

    const result = await this.sessions.rotateRefreshToken({
      oldTokenHash,
      newSessionId,
      newTokenHash,
    })

    if (result.status !== 'OK') {
      throw new UnauthorizedException()
    }

    const accessToken = this.tokens.generateAccessToken({
      userId: result.userId,
      sessionId: newSessionId,
    })

    return { accessToken, refreshToken: newRefreshToken, sessionId: newSessionId }
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.revokeSession(sessionId)
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex')
    const hash = (await scryptAsync(password, salt, this.config.get('SCRYPT_KEYLEN'))) as Buffer
    return `${salt}$${hash.toString('hex')}`
  }

  private async buildSession(userId: string, userAgent: string, ip: string): Promise<AuthResponse> {
    const sessionId = randomUUID()
    const refreshToken = this.tokens.generateRefreshToken()
    const tokenHash = this.tokens.hashToken(refreshToken)

    const payload: JwtPayload = { userId, sessionId }
    const accessToken = this.tokens.generateAccessToken(payload)

    await this.sessions.createSession({ sessionId, userId, tokenHash, userAgent, ip })

    return { accessToken, refreshToken, sessionId }
  }

  private buildDefaultDisplayName(email: string): string {
    const localPart = email.split('@')[0]?.replace(/[^a-zA-Z0-9_-]/g, '') ?? ''
    const displayName = localPart.slice(0, 80)
    return displayName.length >= 2 ? displayName : 'player'
  }

  private async buildAvailableNickname(displayName: string): Promise<string> {
    const base = normalizeNickname(displayName)

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const nickname = attempt === 0 ? base : `${base}-${attempt + 1}`
      const existing = await this.db.db
        .selectFrom('users')
        .select('id')
        .where('nickname', '=', nickname)
        .where('deleted_at', 'is', null)
        .executeTakeFirst()

      if (!existing) {
        return nickname
      }
    }

    return `${base}-${randomUUID().slice(0, 6)}`
  }

  private async verifyPassword(password: string, stored: string): Promise<boolean> {
    const [salt, hash] = stored.split('$')
    if (!salt || !hash) return false

    const hashBuffer = Buffer.from(hash, 'hex')
    const derived = (await scryptAsync(password, salt, this.config.get('SCRYPT_KEYLEN'))) as Buffer

    return timingSafeEqual(hashBuffer, derived)
  }
}

function normalizeNickname(value: string): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)

  return normalized.length >= 2 ? normalized : 'player'
}
