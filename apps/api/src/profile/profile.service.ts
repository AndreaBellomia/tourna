import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { UpdateProfileInput } from '@repo/contracts'
import { StorageService } from '~/storage/storage.service'
import { ProfileRepository } from './profile.repository'

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly storage: StorageService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.profileRepository.getProfile(userId)

    if (!profile) {
      throw new NotFoundException('Profile not found')
    }

    return await this.withAvatarUrl(profile)
  }

  async updateProfile(userId: string, updates: UpdateProfileInput) {
    if (!isValidUserAvatarKey(updates.avatarObjectKey, userId)) {
      throw new BadRequestException('Avatar object key does not belong to this user')
    }

    const profile = await this.profileRepository.updateProfile(userId, updates)

    if (!profile) {
      throw new NotFoundException('Profile not found')
    }

    return await this.withAvatarUrl(profile)
  }

  private async withAvatarUrl<T extends { avatarObjectKey: string | null }>(profile: T) {
    return {
      ...profile,
      avatarUrl: await this.storage.createPublicObjectReadUrl(profile.avatarObjectKey),
    }
  }
}

function isValidUserAvatarKey(key: string | null | undefined, userId: string) {
  if (key === undefined || key === null) {
    return true
  }

  const parts = key.split('/')

  return (
    parts[0] === 'public' && parts[1] === 'avatar' && parts[2] === 'users' && parts[5] === userId
  )
}
