import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { BACKUP_NAME, type Backup, restoreBackupSchema } from '@player-ledger/shared'
import { type Request, type Response, Router } from 'express'
import config from '../config.js'
import { sqlite } from '../db/index.js'
import { restoreFrom } from '../db/restore.js'
import { sendError, sendSuccess } from './shared/responses.js'

const router: Router = Router()

const backupDir = join(dirname(config.databasePath), 'backups')

async function writeBackup(): Promise<string> {
  mkdirSync(backupDir, { recursive: true })
  const name = `app-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`
  // The online backup API copies a consistent snapshot, WAL included; copying the file would not.
  await sqlite.backup(join(backupDir, name))
  return name
}

async function postBackup(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, { file: join(backupDir, await writeBackup()) })
}

function getBackups(_req: Request, res: Response): void {
  const names = existsSync(backupDir)
    ? readdirSync(backupDir).filter((name) => BACKUP_NAME.test(name))
    : []
  const backups: Backup[] = names
    .map((name) => {
      const stats = statSync(join(backupDir, name))
      return { name, createdAt: stats.mtime.toISOString(), bytes: stats.size }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  sendSuccess(res, backups)
}

async function postRestore(req: Request, res: Response): Promise<void> {
  const parsed = restoreBackupSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)
  const file = join(backupDir, parsed.data.name)
  if (!existsSync(file)) return sendError(res, 'NOT_FOUND', 404)

  // Restoring is itself undoable: what it replaces is saved first.
  const safety = await writeBackup()
  restoreFrom(file)
  sendSuccess(res, { restored: parsed.data.name, safety })
}

router.get('/', getBackups)
router.post('/', postBackup)
router.post('/restore', postRestore)

export default router
