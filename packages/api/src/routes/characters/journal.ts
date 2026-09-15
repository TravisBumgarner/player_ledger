import {
  createGoalSchema,
  createSessionNoteSchema,
  updateGoalSchema,
} from '@awesomeness-mgmt/shared'
import { type Request, type Response, Router } from 'express'
import {
  createGoal,
  createSessionNote,
  deleteGoal,
  deleteSessionNote,
  listGoals,
  listSessionNotes,
  toGoal,
  toSessionNote,
  updateGoal,
} from '../../db/queries/journal.js'
import { sendError, sendSuccess } from '../shared/responses.js'
import { characterIdOf } from './scope.js'

// Mounted at /api/characters/:characterId.
const router: Router = Router()

type GoalParams = { goalId: string }
type NoteParams = { noteId: string }

async function getGoals(_req: Request, res: Response): Promise<void> {
  const rows = await listGoals(characterIdOf(res))
  sendSuccess(res, rows.map(toGoal))
}

async function postGoal(req: Request, res: Response): Promise<void> {
  const parsed = createGoalSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toGoal(await createGoal(characterIdOf(res), parsed.data)), 201)
}

async function patchGoal(req: Request<GoalParams>, res: Response): Promise<void> {
  const parsed = updateGoalSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const row = await updateGoal(characterIdOf(res), req.params.goalId, parsed.data)
  if (!row) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, toGoal(row))
}

async function removeGoal(req: Request<GoalParams>, res: Response): Promise<void> {
  const deleted = await deleteGoal(characterIdOf(res), req.params.goalId)
  if (!deleted) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, { id: req.params.goalId })
}

async function getSessionNotes(_req: Request, res: Response): Promise<void> {
  const rows = await listSessionNotes(characterIdOf(res))
  sendSuccess(res, rows.map(toSessionNote))
}

async function postSessionNote(req: Request, res: Response): Promise<void> {
  const parsed = createSessionNoteSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toSessionNote(await createSessionNote(characterIdOf(res), parsed.data)), 201)
}

async function removeSessionNote(req: Request<NoteParams>, res: Response): Promise<void> {
  const deleted = await deleteSessionNote(characterIdOf(res), req.params.noteId)
  if (!deleted) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, { id: req.params.noteId })
}

router.get('/goals', getGoals)
router.post('/goals', postGoal)
router.patch('/goals/:goalId', patchGoal)
router.delete('/goals/:goalId', removeGoal)
router.get('/session-notes', getSessionNotes)
router.post('/session-notes', postSessionNote)
router.delete('/session-notes/:noteId', removeSessionNote)

export default router
