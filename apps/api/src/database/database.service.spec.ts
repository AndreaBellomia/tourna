import { DatabaseService } from './database.service'
import { KyselyDatabase } from '@repo/db'

describe('DatabaseService', () => {
  const dbMock = {} as KyselyDatabase
  const destroyMock = jest.fn()

  let service: DatabaseService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new DatabaseService({ db: dbMock, destroy: destroyMock } as never)
  })

  it('exposes the db instance via getter', () => {
    expect(service.db).toBe(dbMock)
  })

  it('calls destroy on module destroy', async () => {
    await service.onModuleDestroy()

    expect(destroyMock).toHaveBeenCalledTimes(1)
  })
})
