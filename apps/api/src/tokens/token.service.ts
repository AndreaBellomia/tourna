import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '@repo/domain'
import { randomBytes, createHash } from 'crypto'

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwt.sign(payload)
  }

  generateRefreshToken(): string {
    return randomBytes(64).toString('hex')
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
