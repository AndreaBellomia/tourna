import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, '../migrations')

const name = process.argv[2]

if (!name) {
  console.error('Usage: tsx scripts/create-migration.ts <migration_name>')
  console.error('Example: tsx scripts/create-migration.ts add_user_roles')
  process.exit(1)
}

const timestamp = new Date()
  .toISOString()
  .replace(/[-T:.Z]/g, '')
  .slice(0, 14)

const filename = `${timestamp}_${name}.ts`
const filepath = path.join(migrationsDir, filename)

const template = `import { type DbMigration } from '../src/migrator.js'

export const up: DbMigration = async ({ context: db }) => {
  // TODO: implement up migration
}

export const down: DbMigration = async ({ context: db }) => {
  // TODO: implement down migration
}
`

try {
  fs.writeFileSync(filepath, template)
  console.log(`Created migration: migrations/${filename}`)
} catch (err) {
  console.error('Error creating migration:', err)
  process.exit(1)
}
