jest.mock('@repo/db', () => {
  class InvalidCursorError extends Error {}

  return {
    InvalidCursorError,
    paginateCursor: jest.fn(),
  }
})

import { Test, TestingModule } from '@nestjs/testing'
import { TeamController } from './team.controller'
import { TeamService } from './team.service'

describe('TeamController', () => {
  let controller: TeamController
  const teamServiceMock = {
    getTeams: jest.fn(),
  }

  beforeEach(async () => {
    teamServiceMock.getTeams.mockReset()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [{ provide: TeamService, useValue: teamServiceMock }],
    }).compile()

    controller = module.get<TeamController>(TeamController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('passes validated team list query to the service', async () => {
    const response = {
      data: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
    }

    teamServiceMock.getTeams.mockResolvedValue(response)

    await expect(
      controller.getTeams(undefined, {
        limit: 10,
        direction: 'next',
        search: 'atlas',
        visibility: 'public',
      }),
    ).resolves.toBe(response)
    expect(teamServiceMock.getTeams).toHaveBeenCalledWith(
      {
        limit: 10,
        direction: 'next',
        search: 'atlas',
        visibility: 'public',
      },
      undefined,
    )
  })
})
