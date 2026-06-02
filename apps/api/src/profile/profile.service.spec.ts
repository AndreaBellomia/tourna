import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from '../storage/storage.service'
import { ProfileRepository } from './profile.repository'
import { ProfileService } from './profile.service'

describe('ProfileService', () => {
  let service: ProfileService
  const profileRepositoryMock = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  }
  const storageMock = {
    createPublicObjectReadUrl: jest.fn(),
  }

  beforeEach(async () => {
    profileRepositoryMock.getProfile.mockReset()
    profileRepositoryMock.updateProfile.mockReset()
    storageMock.createPublicObjectReadUrl.mockReset()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: ProfileRepository, useValue: profileRepositoryMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile()

    service = module.get<ProfileService>(ProfileService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('returns the authenticated profile with a public avatar URL', async () => {
    profileRepositoryMock.getProfile.mockResolvedValue({
      id: 'user-1',
      display_name: 'Andrea',
      email: 'andrea@example.com',
      bio: 'Bio',
      avatarObjectKey: 'public/avatar/users/2026/06/user-1/avatar.png',
    })
    storageMock.createPublicObjectReadUrl.mockResolvedValue('https://cdn.test/avatar.png')

    await expect(service.getProfile('user-1')).resolves.toEqual({
      id: 'user-1',
      display_name: 'Andrea',
      email: 'andrea@example.com',
      bio: 'Bio',
      avatarObjectKey: 'public/avatar/users/2026/06/user-1/avatar.png',
      avatarUrl: 'https://cdn.test/avatar.png',
    })
  })

  it('rejects avatar keys that do not belong to the current user', async () => {
    await expect(
      service.updateProfile('user-1', {
        avatarObjectKey: 'public/avatar/users/2026/06/user-2/avatar.png',
      }),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(profileRepositoryMock.updateProfile).not.toHaveBeenCalled()
  })

  it('throws when the profile does not exist', async () => {
    profileRepositoryMock.getProfile.mockResolvedValue(null)

    await expect(service.getProfile('missing')).rejects.toBeInstanceOf(NotFoundException)
  })
})
