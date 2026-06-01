jest.mock('kysely', () => {
  const sqlTag = () => ({})
  sqlTag.ref = (column: string) => ({ column })

  return { sql: sqlTag }
})

import type { SelectQueryBuilder } from 'kysely'
import {
  type CursorDirection,
  InvalidCursorError,
  decodeCursor,
  encodeCursor,
  paginateCursor,
} from './cursor-pagination'

type TeamFixture = {
  id: string
  createdAt: Date
  name: string
}

type TestDatabase = {
  teams: {
    id: string
    created_at: Date
    name: string
  }
}

const fixtures: TeamFixture[] = [
  { id: 'team-5', createdAt: new Date('2026-01-04T00:00:00.000Z'), name: 'Five' },
  { id: 'team-4', createdAt: new Date('2026-01-03T00:00:00.000Z'), name: 'Four' },
  { id: 'team-3', createdAt: new Date('2026-01-02T00:00:00.000Z'), name: 'Three' },
  { id: 'team-2', createdAt: new Date('2026-01-02T00:00:00.000Z'), name: 'Two' },
  { id: 'team-1', createdAt: new Date('2026-01-01T00:00:00.000Z'), name: 'One' },
]

describe('cursor pagination', () => {
  it('encodes and decodes opaque cursors with filter snapshots', () => {
    const cursor = encodeCursor({
      v: 1,
      fieldValue: '2026-01-04T00:00:00.000Z',
      id: 'team-5',
      filters: { visibility: 'public' },
    })

    expect(cursor).not.toContain('team-5')
    expect(decodeCursor(cursor)).toEqual({
      v: 1,
      fieldValue: '2026-01-04T00:00:00.000Z',
      id: 'team-5',
      filters: { visibility: 'public' },
    })
  })

  it('rejects invalid cursors', () => {
    expect(() => decodeCursor('not-a-valid-cursor')).toThrow(InvalidCursorError)
  })

  it('rejects cursors generated with different filters', async () => {
    const cursor = encodeCursor({
      v: 1,
      fieldValue: '2026-01-04T00:00:00.000Z',
      id: 'team-5',
      filters: { visibility: 'public' },
    })

    await expect(
      paginateCursor(fakeQuery([]).asKyselyQuery(), {
        pagination: { limit: 2, direction: 'next', cursor },
        filters: { visibility: 'private' },
        cursor: cursorConfig,
      }),
    ).rejects.toThrow(InvalidCursorError)
  })

  it('fetches forward pages with limit plus one', async () => {
    const query = fakeQuery(fixtures)
    const page = await pageFromQuery(query, { limit: 2, direction: 'next' })

    expect(query.limitValue).toBe(3)
    expect(query.orderByCalls).toEqual([{ direction: 'desc' }, { direction: 'desc' }])
    expect(page.data.map((item) => item.id)).toEqual(['team-5', 'team-4'])
    expect(page.pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false,
      previousCursor: null,
    })
    expect(page.pageInfo.nextCursor).toEqual(expect.any(String))
  })

  it('keeps records with the same createdAt stable across forward pages', async () => {
    const firstPage = await pageFromQuery(fakeQuery(fixtures), { limit: 3, direction: 'next' })
    const secondPage = await pageFromQuery(fakeQuery(fixtures.slice(3)), {
      limit: 3,
      direction: 'next',
      cursor: firstPage.pageInfo.nextCursor ?? undefined,
    })

    expect(firstPage.data.map((item) => item.id)).toEqual(['team-5', 'team-4', 'team-3'])
    expect(secondPage.data.map((item) => item.id)).toEqual(['team-2', 'team-1'])
    expect(secondPage.pageInfo).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: true,
      nextCursor: null,
    })
    expect(secondPage.pageInfo.previousCursor).toEqual(expect.any(String))
  })

  it('fetches previous pages with temporary ascending order and restores final order', async () => {
    const firstPage = await pageFromQuery(fakeQuery(fixtures), { limit: 2, direction: 'next' })
    const secondPage = await pageFromQuery(fakeQuery(fixtures.slice(2)), {
      limit: 2,
      direction: 'next',
      cursor: firstPage.pageInfo.nextCursor ?? undefined,
    })
    const previousQuery = fakeQuery([fixtures[1], fixtures[0]].filter(isFixture))
    const previousPage = await pageFromQuery(previousQuery, {
      limit: 2,
      direction: 'prev',
      cursor: secondPage.pageInfo.previousCursor ?? undefined,
    })

    expect(previousQuery.orderByCalls).toEqual([{ direction: 'asc' }, { direction: 'asc' }])
    expect(secondPage.data.map((item) => item.id)).toEqual(['team-3', 'team-2'])
    expect(previousPage.data.map((item) => item.id)).toEqual(['team-5', 'team-4'])
    expect(previousPage.pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false,
      previousCursor: null,
    })
    expect(previousPage.pageInfo.nextCursor).toEqual(expect.any(String))
  })
})

const cursorConfig = {
  column: 'created_at',
  outputKey: 'createdAt',
  idColumn: 'id',
  direction: 'desc',
} as const

function pageFromQuery(
  query: FakeQuery,
  pagination: { limit: number; cursor?: string; direction: CursorDirection },
) {
  return paginateCursor(query.asKyselyQuery(), {
    pagination,
    filters: {},
    cursor: cursorConfig,
  })
}

type OrderByCall = {
  direction: 'asc' | 'desc'
}

class FakeQuery {
  limitValue: number | undefined
  orderByCalls: OrderByCall[] = []
  whereCallCount = 0

  constructor(private readonly rows: TeamFixture[]) {}

  where(): this {
    this.whereCallCount += 1
    return this
  }

  orderBy(_expression: unknown, direction: 'asc' | 'desc'): this {
    this.orderByCalls.push({ direction })
    return this
  }

  limit(limit: number): this {
    this.limitValue = limit
    return this
  }

  execute(): Promise<TeamFixture[]> {
    return Promise.resolve(this.rows.slice(0, this.limitValue))
  }

  asKyselyQuery(): SelectQueryBuilder<TestDatabase, 'teams', TeamFixture> {
    return this as unknown as SelectQueryBuilder<TestDatabase, 'teams', TeamFixture>
  }
}

function fakeQuery(rows: TeamFixture[]): FakeQuery {
  return new FakeQuery(rows)
}

function isFixture(value: TeamFixture | undefined): value is TeamFixture {
  return value !== undefined
}
