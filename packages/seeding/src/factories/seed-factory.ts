import { faker as baseFaker, type Faker } from '@faker-js/faker'

export type SeedFactoryOverrides<T> = Partial<T> | ((context: SeedFactoryContext<T>) => Partial<T>)

export interface SeedFactoryContext<T> {
  sequence: number
  now: Date
  faker: Faker
  slugify(this: void, value: string): string
  pick<const TValues extends readonly unknown[]>(this: void, values: TValues): TValues[number]
  overrides?: SeedFactoryOverrides<T>
}

export interface SeedFactory<T extends object> {
  build(overrides?: SeedFactoryOverrides<T>): T
  buildList(
    count: number,
    overrides?: SeedFactoryOverrides<T> | ((index: number) => SeedFactoryOverrides<T>),
  ): T[]
  reset(sequence?: number): void
}

export interface DefineSeedFactoryOptions {
  seedBase?: number
}

export function defineSeedFactory<T extends object>(
  buildDefaults: (context: SeedFactoryContext<T>) => T,
  options: DefineSeedFactoryOptions = {},
): SeedFactory<T> {
  let sequence = 0
  const seedBase = options.seedBase ?? 10_000
  const buildOne = (overrides?: SeedFactoryOverrides<T>): T => {
    sequence += 1
    const context = createFactoryContext<T>(sequence, seedBase, overrides)
    const base = buildDefaults(context)
    const resolvedOverrides = resolveOverrides(overrides, context)

    return {
      ...base,
      ...resolvedOverrides,
    }
  }

  return {
    build: buildOne,
    buildList: (count, overrides) =>
      Array.from({ length: count }, (_, index) => {
        const resolvedOverrides =
          typeof overrides === 'function'
            ? (overrides as (index: number) => SeedFactoryOverrides<T>)(index)
            : overrides

        return buildOne(resolvedOverrides)
      }),
    reset: (nextSequence = 0) => {
      sequence = nextSequence
    },
  }
}

export function slugifySeedValue(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'seed'
}

function createFactoryContext<T extends object>(
  sequence: number,
  seedBase: number,
  overrides?: SeedFactoryOverrides<T>,
): SeedFactoryContext<T> {
  baseFaker.seed(seedBase + sequence)

  return {
    sequence,
    now: new Date('2026-01-01T00:00:00.000Z'),
    faker: baseFaker,
    slugify: slugifySeedValue,
    pick: (values) => values[(sequence - 1) % values.length],
    overrides,
  }
}

function resolveOverrides<T extends object>(
  overrides: SeedFactoryOverrides<T> | undefined,
  context: SeedFactoryContext<T>,
): Partial<T> {
  if (!overrides) {
    return {}
  }

  if (typeof overrides === 'function') {
    return overrides(context)
  }

  return overrides
}
