import { Injectable } from '@nestjs/common'
import { type CursorPaginatedResult, type CursorPaginationInput, paginateCursor } from '@repo/db'
import { DatabaseService } from '../database/database.service'

type UserRow = {
  id: string
  display_name: string
  bio: string | null
  avatarObjectKey: string | null
  createdAt: Date
}

export type PublicUser = Omit<UserRow, 'createdAt'> & {
  createdAt: string
}

export type UserListFilters = {
  search?: string
}

export type ListUsersInput = {
  filters?: UserListFilters
  pagination: CursorPaginationInput
}

@Injectable()
export class UserRepository {
  constructor(private readonly database: DatabaseService) {}

  async listUsers(input: ListUsersInput): Promise<CursorPaginatedResult<PublicUser>> {
    let query = this.database.db
      .selectFrom('users')
      .select([
        'id',
        'display_name',
        'bio',
        'avatar_object_key as avatarObjectKey',
        'created_at as createdAt',
      ])
      .where('deleted_at', 'is', null)

    if (input.filters?.search) {
      const pattern = `%${input.filters.search}%`

      query = query.where((eb) =>
        eb.or([eb('display_name', 'ilike', pattern), eb('bio', 'ilike', pattern)]),
      )
    }

    return await paginateCursor(query, {
      pagination: input.pagination,
      filters: input.filters,
      cursor: {
        column: 'created_at',
        outputKey: 'createdAt',
        idColumn: 'id',
        direction: 'desc',
      },
      mapItem: toPublicUser,
    })
  }

  async getUserById(userId: string): Promise<PublicUser | null> {
    const user = await this.database.db
      .selectFrom('users')
      .select([
        'id',
        'display_name',
        'bio',
        'avatar_object_key as avatarObjectKey',
        'created_at as createdAt',
      ])
      .where('id', '=', userId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst()

    return user ? toPublicUser(user) : null
  }
}

function toPublicUser(user: UserRow): PublicUser {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  }
}
