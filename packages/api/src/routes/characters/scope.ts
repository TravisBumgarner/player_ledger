import type { NextFunction, Request, Response } from 'express'
import { findCharacter } from '../../db/queries/users.js'
import { sendError } from '../shared/responses.js'

type Locals = { characterId: string }

/** Every ledger route is scoped to a character that exists; nothing below re-checks it. */
export async function requireCharacter(
  req: Request<{ characterId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const character = await findCharacter(req.params.characterId)
  if (!character) return sendError(res, 'NOT_FOUND', 404)
  ;(res.locals as Locals).characterId = character.id
  next()
}

export function characterIdOf(res: Response): string {
  return (res.locals as Locals).characterId
}
