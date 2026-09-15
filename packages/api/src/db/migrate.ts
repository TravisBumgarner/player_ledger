import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import config from '../config.js'
import { db, sqlite } from './index.js'

const here = dirname(fileURLToPath(import.meta.url))

// In dev (tsx) this file sits at src/db; bundled it is dist/migrate.js.
// The migrations folder is at packages/api/drizzle either way.
const isDev = here.endsWith('src/db') || here.endsWith('src\\db')
const migrationsFolder = isDev
  ? resolve(here, '..', '..', 'drizzle')
  : resolve(here, '..', 'drizzle')

try {
  console.log(`Running migrations from ${migrationsFolder} against ${config.databasePath}`)
  migrate(db, { migrationsFolder })
  console.log('Migrations complete')
} catch (err) {
  console.error('Migration failed:', err)
  process.exitCode = 1
} finally {
  sqlite.close()
}
