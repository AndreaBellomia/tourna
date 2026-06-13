const integration = require('./test/jest-integration.config.cjs')

const unit = {
  displayName: 'unit',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '^(?!.*\\.integration-spec\\.ts$).*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^~$': '<rootDir>/src',
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@app/shared(|/.*)$': '<rootDir>/libs/shared/src/$1',
  },
}

module.exports = {
  projects: [unit, integration],
}
