/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx', 'lua'],
  moduleNameMapper: {
    '^@repo/email$': '<rootDir>/packages/email/src/index.ts',
    '^@repo/email/contracts$': '<rootDir>/packages/email/src/contracts.ts',
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          target: 'es2022',
          esModuleInterop: true,
          jsx: 'react-jsx',
          baseUrl: '.',
          paths: {
            '@repo/email': ['packages/email/src/index.ts'],
            '@repo/email/contracts': ['packages/email/src/contracts.ts'],
          },
        },
      },
    ],
    '\\.lua$': '<rootDir>/jest.lua-transform.cjs',
  },
}
