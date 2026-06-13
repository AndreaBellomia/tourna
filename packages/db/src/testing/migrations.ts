import { promises as fs } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { FileMigrationProvider } from 'kysely/migration'

const requireMigration = createRequire(__filename)

export type TestMigrationProviderOptions = {
  migrationFolder?: string
}

export function createTestMigrationProvider(options: TestMigrationProviderOptions = {}) {
  return new FileMigrationProvider({
    fs,
    path,
    migrationFolder: options.migrationFolder ?? defaultMigrationFolder(),
    import: loadMigrationModule,
    onFileIgnored: (fileName, reason) => {
      if (reason === 'NotMigration') {
        throw new Error(`Migration file ${fileName} does not export an up migration`)
      }
    },
  })
}

function defaultMigrationFolder() {
  return path.resolve(__dirname, '../../migrations')
}

function loadMigrationModule(filePath: string): Promise<unknown> {
  const resolvedPath = requireMigration.resolve(filePath)

  delete requireMigration.cache[resolvedPath]

  return Promise.resolve(requireMigration(resolvedPath) as unknown)
}
