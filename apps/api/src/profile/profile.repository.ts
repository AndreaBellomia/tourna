import { Injectable } from '@nestjs/common'
import type { UpdateProfileInput } from '@repo/contracts'
import { DatabaseService } from '../database/database.service'

type ProfileRow = {
  id: string
  display_name: string
  email: string
  bio: string | null
  avatarObjectKey: string | null
}

@Injectable()
export class ProfileRepository {
  constructor(private readonly database: DatabaseService) {}

  async getProfile(userId: string): Promise<ProfileRow | null> {
    const profile = await this.database.db
      .selectFrom('users')
      .select(['id', 'display_name', 'email', 'bio', 'avatar_object_key as avatarObjectKey'])
      .where('id', '=', userId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst()

    return profile ?? null
  }

  async updateProfile(userId: string, updates: UpdateProfileInput): Promise<ProfileRow | null> {
    const values = {
      ...(updates.display_name ? { display_name: updates.display_name } : {}),
      ...(updates.bio !== undefined ? { bio: updates.bio || null } : {}),
      ...(updates.avatarObjectKey !== undefined
        ? { avatar_object_key: updates.avatarObjectKey || null }
        : {}),
      updated_at: new Date(),
    }

    const [profile] = await this.database.db
      .updateTable('users')
      .set(values)
      .where('id', '=', userId)
      .where('deleted_at', 'is', null)
      .returning(['id'])
      .execute()

    return profile ? this.getProfile(profile.id) : null
  }
}
