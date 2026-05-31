import { Injectable } from '@nestjs/common'
import { Action, buildAbility, Subject } from '@repo/authorization'
import { CacheService } from '../cache/cache.service'
import { CacheKeys } from '@repo/redis'
import { DatabaseService } from '../database/database.service'
import { DatabaseSchema } from '@repo/db'
import { Selectable } from 'kysely'
import { AppConfigService } from '../config/config.service'

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly databaseService: DatabaseService,
    private readonly configService: AppConfigService,
  ) {}

  async getByUser(userId: string): Promise<Selectable<DatabaseSchema['memberships']>[]> {
    return this.cacheService.getOrSet(
      CacheKeys.memberships(userId),
      () =>
        this.databaseService.db
          .selectFrom('memberships')
          .selectAll()
          .where('user_id', '=', userId)
          .execute(),
      this.configService.get('CACHE_DURATION_AUTHORIZATION'),
    )
  }

  async build(userId: string) {
    const memberships = await this.getByUser(userId)
    return buildAbility(memberships)
  }

  async check(userId: string, action: Action, subject: Subject) {
    const ability = await this.build(userId)
    return ability.can(action, subject)
  }
}
