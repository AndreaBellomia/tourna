/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx', 'lua'],
  moduleNameMapper: {
    '^@repo/db$': '<rootDir>/packages/db/src/index.ts',
    '^@repo/db/testing$': '<rootDir>/packages/db/src/testing/index.ts',
    '^@repo/domain$': '<rootDir>/packages/domain/src/index.ts',
    '^@repo/email$': '<rootDir>/packages/email/src/index.ts',
    '^@repo/email/contracts$': '<rootDir>/packages/email/src/contracts.ts',
    '^@repo/redis$': '<rootDir>/packages/redis/src/index.ts',
    '^@repo/redis/testing$': '<rootDir>/packages/redis/src/testing/index.ts',
    '^@repo/storage$': '<rootDir>/packages/storage/src/index.ts',
    '^@repo/storage/testing$': '<rootDir>/packages/storage/src/testing/index.ts',
  },
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!.*@faker-js/faker)'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'Bundler',
          customConditions: ['source'],
          target: 'es2022',
          strict: true,
          isolatedModules: true,
          allowJs: true,
          esModuleInterop: true,
          jsx: 'react-jsx',
          baseUrl: '.',
          paths: {
            '@repo/db': ['packages/db/src/index.ts'],
            '@repo/db/testing': ['packages/db/src/testing/index.ts'],
            '@repo/domain': ['packages/domain/src/index.ts'],
            '@repo/email': ['packages/email/src/index.ts'],
            '@repo/email/contracts': ['packages/email/src/contracts.ts'],
            '@repo/redis': ['packages/redis/src/index.ts'],
            '@repo/redis/testing': ['packages/redis/src/testing/index.ts'],
            '@repo/storage': ['packages/storage/src/index.ts'],
            '@repo/storage/testing': ['packages/storage/src/testing/index.ts'],
          },
        },
      },
    ],
    '\\.lua$': '<rootDir>/jest.lua-transform.cjs',
  },
}
