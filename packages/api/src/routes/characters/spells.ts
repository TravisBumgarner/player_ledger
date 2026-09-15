import { createSpellSchema, updateSpellSchema } from '@awesomeness-mgmt/shared'
import { type Request, type Response, Router } from 'express'
import {
  castSpell,
  createSpell,
  deleteSpell,
  listSpells,
  toSpell,
  updateSpell,
} from '../../db/queries/spells.js'
import { sendError, sendSuccess } from '../shared/responses.js'
import { characterIdOf } from './scope.js'

// Mounted at /api/characters/:characterId/spells.
const router: Router = Router()

type SpellParams = { spellId: string }

async function getSpells(_req: Request, res: Response): Promise<void> {
  const rows = await listSpells(characterIdOf(res))
  sendSuccess(res, rows.map(toSpell))
}

async function postSpell(req: Request, res: Response): Promise<void> {
  const parsed = createSpellSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toSpell(await createSpell(characterIdOf(res), parsed.data)), 201)
}

async function patchSpell(req: Request<SpellParams>, res: Response): Promise<void> {
  const parsed = updateSpellSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const row = await updateSpell(characterIdOf(res), req.params.spellId, parsed.data)
  if (!row) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, toSpell(row))
}

async function removeSpell(req: Request<SpellParams>, res: Response): Promise<void> {
  const deleted = await deleteSpell(characterIdOf(res), req.params.spellId)
  if (!deleted) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, { id: req.params.spellId })
}

async function postCast(req: Request<SpellParams>, res: Response): Promise<void> {
  const row = await castSpell(characterIdOf(res), req.params.spellId)
  if (!row) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, toSpell(row))
}

router.get('/', getSpells)
router.post('/', postSpell)
router.patch('/:spellId', patchSpell)
router.delete('/:spellId', removeSpell)
router.post('/:spellId/cast', postCast)

export default router
