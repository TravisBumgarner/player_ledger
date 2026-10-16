import type { ErrorCode } from '@player-ledger/shared'
import type { Response } from 'express'

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data })
}

export function sendError(res: Response, errorCode: ErrorCode, status = 400): void {
  res.status(status).json({ success: false, errorCode })
}
