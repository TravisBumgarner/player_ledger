import { sqlite } from './index.js'

type Named = { name: string }

const columnsOf = (table: string, schema: 'main' | 'bk') =>
  (sqlite.prepare('SELECT name FROM pragma_table_info(?, ?)').all(table, schema) as Named[]).map(
    (column) => column.name,
  )

/**
 * Replaces every row with the backup's, in place, so the open connection everything holds
 * stays valid. Table and column names come from our own schema, never from the request.
 */
export function restoreFrom(file: string): void {
  sqlite.prepare('ATTACH DATABASE ? AS bk').run(file)
  try {
    const tables = (
      sqlite
        .prepare(
          "SELECT name FROM main.sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations'",
        )
        .all() as Named[]
    ).map((table) => table.name)

    sqlite.transaction(() => {
      sqlite.pragma('defer_foreign_keys = ON')
      // Every delete before any insert: a cascade from a later delete would take rows already copied.
      for (const table of tables) sqlite.exec(`DELETE FROM main."${table}"`)
      for (const table of tables) {
        // An older backup may lack newer columns; those take their defaults.
        const inBackup = new Set(columnsOf(table, 'bk'))
        const columns = columnsOf(table, 'main').filter((column) => inBackup.has(column))
        if (columns.length === 0) continue
        const list = columns.map((column) => `"${column}"`).join(', ')
        sqlite.exec(`INSERT INTO main."${table}" (${list}) SELECT ${list} FROM bk."${table}"`)
      }
    })()
  } finally {
    sqlite.exec('DETACH DATABASE bk')
  }
}
