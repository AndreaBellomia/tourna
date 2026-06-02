jest.mock('@repo/db', () => ({
  paginateCursor: jest.fn(),
}))

import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from '../storage/storage.service'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService
  const userRepositoryMock = {
    listUsers: jest.fn(),
    getUserByIdentifier: jest.fn(),
  }
  const storageMock = {
    createPublicObjectReadUrl: jest.fn(),
  }

  beforeEach(async () => {
    userRepositoryMock.listUsers.mockReset()
    userRepositoryMock.getUserByIdentifier.mockReset()
    storageMock.createPublicObjectReadUrl.mockReset()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('lists public users with avatar URLs', async () => {
    userRepositoryMock.listUsers.mockResolvedValue({
      data: [
        {
          id: 'user-1',
          display_name: 'Andrea',
          bio: null,
          avatarObjectKey: 'public/avatar/users/2026/06/user-1/avatar.png',
          createdAt: '2026-06-02T10:00:00.000Z',
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
    })
    storageMock.createPublicObjectReadUrl.mockResolvedValue('https://cdn.test/avatar.png')

    await expect(service.getUsers({ limit: 12, direction: 'next' })).resolves.toEqual({
      data: [
        {
          id: 'user-1',
          display_name: 'Andrea',
          bio: null,
          avatarObjectKey: 'public/avatar/users/2026/06/user-1/avatar.png',
          avatarUrl: 'https://cdn.test/avatar.png',
          createdAt: '2026-06-02T10:00:00.000Z',
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
    })
  })

  it('throws when a public user does not exist', async () => {
    userRepositoryMock.getUserByIdentifier.mockResolvedValue(null)

    await expect(service.getUser('missing')).rejects.toBeInstanceOf(NotFoundException)
  })
})
