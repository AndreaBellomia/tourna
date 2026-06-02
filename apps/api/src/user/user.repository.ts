import { Injectable } from '@nestjs/common'
import { type CursorPaginatedResult, type CursorPaginationInput, paginateCursor } from '@repo/db'
import { DatabaseService } from '../database/database.service'

type UserRow = {
  id: string
  display_name: string
  nickname: string
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
        'nickname',
        'bio',
        'avatar_object_key as avatarObjectKey',
        'created_at as createdAt',
      ])
      .where('deleted_at', 'is', null)

    if (input.filters?.search) {
      const pattern = `%${input.filters.search}%`

      query = query.where((eb) =>
        eb.or([
          eb('display_name', 'ilike', pattern),
          eb('nickname', 'ilike', pattern),
          eb('bio', 'ilike', pattern),
        ]),
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

  async getUserByIdentifier(identifier: string): Promise<PublicUser | null> {
    let query = this.database.db
      .selectFrom('users')
      .select([
        'id',
        'display_name',
        'nickname',
        'bio',
        'avatar_object_key as avatarObjectKey',
        'created_at as createdAt',
      ])
      .where('deleted_at', 'is', null)

    query = isNumericIdentifier(identifier)
      ? query.where((eb) => eb.or([eb('id', '=', identifier), eb('nickname', '=', identifier)]))
      : query.where('nickname', '=', identifier)

    const user = await query.executeTakeFirst()

    return user ? toPublicUser(user) : null
  }
}

function isNumericIdentifier(identifier: string) {
  return /^\d+$/.test(identifier)
}

function toPublicUser(user: UserRow): PublicUser {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  }
}
