import type { ApiResponse, Backup, RestoreBackup } from '@awesomeness-mgmt/shared'
import { apiFetch } from './client'

export function createBackup(): Promise<ApiResponse<{ file: string }>> {
  return apiFetch('/backup', { method: 'POST' })
}

export function getBackups(): Promise<ApiResponse<Backup[]>> {
  return apiFetch('/backup')
}

export function restoreBackup(
  body: RestoreBackup,
): Promise<ApiResponse<{ restored: string; safety: string }>> {
  return apiFetch('/backup/restore', { method: 'POST', body })
}
