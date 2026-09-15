import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import config from '../config.js'
import * as schema from './schema.js'

mkdirSync(dirname(config.databasePath), { recursive: true })

const sqlite: Database.Database = new Database(config.databasePath)
// WAL lets reads proceed during a write; foreign keys are off per connection unless asked for.
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

export { schema, sqlite }
