import { z } from 'zod'

/** Only names the backup route itself writes: no separators, so nothing outside the folder. */
export const BACKUP_NAME = /^app-[0-9TZ-]+\.sqlite$/

export const backupSchema = z.object({
  name: z.string(),
  createdAt: z.string(),
  bytes: z.number(),
})
export type Backup = z.infer<typeof backupSchema>

export const restoreBackupSchema = z.object({ name: z.string().regex(BACKUP_NAME) })
export type RestoreBackup = z.infer<typeof restoreBackupSchema>
