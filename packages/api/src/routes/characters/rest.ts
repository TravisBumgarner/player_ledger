import { takeRestSchema } from '@player-ledger/shared'
import { type Request, type Response, Router } from 'express'
import { getRestState, takeRest, toRestState } from '../../db/queries/rest.js'
import { sendError, sendSuccess } from '../shared/responses.js'
import { characterIdOf } from './scope.js'

// Mounted at /api/characters/:characterId/rest.
const router: Router = Router()

async function getRest(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, toRestState(await getRestState(characterIdOf(res))))
}

async function postRest(req: Request, res: Response): Promise<void> {
  const parsed = takeRestSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toRestState(await takeRest(characterIdOf(res), parsed.data.kind)))
}

router.get('/', getRest)
router.post('/', postRest)

export default router
