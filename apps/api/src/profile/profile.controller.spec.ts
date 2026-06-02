import { Test, TestingModule } from '@nestjs/testing'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'

describe('ProfileController', () => {
  let controller: ProfileController
  const profileServiceMock = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  }

  beforeEach(async () => {
    profileServiceMock.getProfile.mockReset()
    profileServiceMock.updateProfile.mockReset()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: ProfileService, useValue: profileServiceMock }],
    }).compile()

    controller = module.get<ProfileController>(ProfileController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('updates the current user profile', async () => {
    const response = {
      id: 'user-1',
      display_name: 'Andrea',
      email: 'andrea@example.com',
      bio: null,
      avatarObjectKey: null,
      avatarUrl: null,
    }
    profileServiceMock.updateProfile.mockResolvedValue(response)

    await expect(
      controller.updateProfile({ userId: 'user-1' } as never, { display_name: 'Andrea' } as never),
    ).resolves.toBe(response)
    expect(profileServiceMock.updateProfile).toHaveBeenCalledWith('user-1', {
      display_name: 'Andrea',
    })
  })
})
