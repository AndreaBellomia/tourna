jest.mock('@repo/db', () => {
  class InvalidCursorError extends Error {}

  return {
    InvalidCursorError,
    paginateCursor: jest.fn(),
  }
})

import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from '~/storage/storage.service'
import { TeamService } from './team.service'
import { TeamRepository } from './team.repository'

describe('TeamService', () => {
  let service: TeamService
  const teamRepositoryMock = {
    listTeams: jest.fn(),
    getTeamDetailByIdentifier: jest.fn(),
  }
  const storageMock = {
    createPublicObjectReadUrl: jest.fn(),
  }

  beforeEach(async () => {
    teamRepositoryMock.listTeams.mockReset()
    teamRepositoryMock.getTeamDetailByIdentifier.mockReset()
    storageMock.createPublicObjectReadUrl.mockReset()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: TeamRepository, useValue: teamRepositoryMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile()

    service = module.get<TeamService>(TeamService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('lists teams through the repository', async () => {
    const response = {
      data: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
    }

    teamRepositoryMock.listTeams.mockResolvedValue(response)

    await expect(
      service.getTeams({ limit: 25, direction: 'next', search: 'atlas', visibility: 'public' }),
    ).resolves.toEqual(response)
    expect(teamRepositoryMock.listTeams).toHaveBeenCalledWith({
      filters: { search: 'atlas', visibility: 'public' },
      pagination: { limit: 25, direction: 'next' },
    })
  })

  it('does not enumerate non-public teams from the public listing', async () => {
    await expect(
      service.getTeams({ limit: 25, direction: 'next', visibility: 'private' }),
    ).resolves.toEqual({
      data: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
    })
    expect(teamRepositoryMock.listTeams).not.toHaveBeenCalled()
  })
})
