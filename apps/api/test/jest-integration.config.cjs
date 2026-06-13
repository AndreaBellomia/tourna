const path = require('node:path')

const apiRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(apiRoot, '../..')

/** @type {import('jest').Config} */
module.exports = {
  displayName: 'integration',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: apiRoot,
  testEnvironment: 'node',
  testRegex: '.*\\.integration-spec\\.ts$',
  transformIgnorePatterns: ['/node_modules/(?!.*kysely)'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          target: 'es2022',
          strict: true,
          allowJs: true,
          esModuleInterop: true,
          baseUrl: apiRoot,
          paths: {
            '~': ['src'],
            '~/*': ['src/*'],
            '@repo/db': [path.join(repoRoot, 'packages/db/src/index.ts')],
            '@repo/db/testing': [path.join(repoRoot, 'packages/db/src/testing/index.ts')],
            '@repo/domain': [path.join(repoRoot, 'packages/domain/src/index.ts')],
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    '^~$': '<rootDir>/src',
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@repo/db$': path.join(repoRoot, 'packages/db/src/index.ts'),
    '^@repo/db/testing$': path.join(repoRoot, 'packages/db/src/testing/index.ts'),
    '^@repo/domain$': path.join(repoRoot, 'packages/domain/src/index.ts'),
    '^@app/shared(|/.*)$': '<rootDir>/libs/shared/src/$1',
  },
}
