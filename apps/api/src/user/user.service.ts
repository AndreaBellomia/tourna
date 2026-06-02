import { Injectable, NotFoundException } from '@nestjs/common'
import type { UserDetailResponse, UserListQuery, UserListResponse } from '@repo/contracts'
import { StorageService } from '../storage/storage.service'
import { UserRepository, type PublicUser } from './user.repository'

@Injectable()
export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly storage: StorageService,
  ) {}

  async getUsers(query: UserListQuery): Promise<UserListResponse> {
    const { search, ...pagination } = query
    const result = await this.users.listUsers({
      filters: search ? { search } : {},
      pagination,
    })

    return {
      ...result,
      data: await Promise.all(result.data.map((user) => this.withAvatarUrl(user))),
    }
  }

  async getUser(userId: string): Promise<UserDetailResponse> {
    const user = await this.users.getUserByIdentifier(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return await this.withAvatarUrl(user)
  }

  private async withAvatarUrl(user: PublicUser): Promise<UserDetailResponse> {
    return {
      ...user,
      avatarUrl: await this.storage.createPublicObjectReadUrl(user.avatarObjectKey),
    }
  }
}
