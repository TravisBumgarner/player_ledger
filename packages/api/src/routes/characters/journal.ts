import {
  createGoalSchema,
  createSessionNoteSchema,
  type NoteKind,
  updateCharacterDevelopmentSchema,
  updateGoalSchema,
  updateSessionNoteSchema,
} from '@awesomeness-mgmt/shared'
import { type Request, type Response, Router } from 'express'
import {
  createGoal,
  createSessionNote,
  deleteGoal,
  deleteSessionNote,
  getCharacterDevelopment,
  listGoals,
  listSessionNotes,
  saveCharacterDevelopment,
  toGoal,
  toSessionNote,
  updateGoal,
  updateSessionNote,
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

/** Session notes and brewing notes share a shape and a table; only the path and kind differ. */
function notesRouter(kind: NoteKind): Router {
  const notes: Router = Router()

  notes.get('/', async (_req: Request, res: Response) => {
    const rows = await listSessionNotes(characterIdOf(res), kind)
    sendSuccess(res, rows.map(toSessionNote))
  })

  notes.post('/', async (req: Request, res: Response) => {
    const parsed = createSessionNoteSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

    const row = await createSessionNote(characterIdOf(res), kind, parsed.data)
    sendSuccess(res, toSessionNote(row), 201)
  })

  notes.patch('/:noteId', async (req: Request<NoteParams>, res: Response) => {
    const parsed = updateSessionNoteSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

    const row = await updateSessionNote(characterIdOf(res), kind, req.params.noteId, parsed.data)
    if (!row) return sendError(res, 'NOT_FOUND', 404)
    sendSuccess(res, toSessionNote(row))
  })

  notes.delete('/:noteId', async (req: Request<NoteParams>, res: Response) => {
    const deleted = await deleteSessionNote(characterIdOf(res), kind, req.params.noteId)
    if (!deleted) return sendError(res, 'NOT_FOUND', 404)
    sendSuccess(res, { id: req.params.noteId })
  })

  return notes
}

async function getDevelopment(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await getCharacterDevelopment(characterIdOf(res)))
}

async function putDevelopment(req: Request, res: Response): Promise<void> {
  const parsed = updateCharacterDevelopmentSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, await saveCharacterDevelopment(characterIdOf(res), parsed.data.body))
}

router.get('/goals', getGoals)
router.post('/goals', postGoal)
router.patch('/goals/:goalId', patchGoal)
router.delete('/goals/:goalId', removeGoal)
router.use('/session-notes', notesRouter('session'))
router.use('/brewing-notes', notesRouter('brewing'))
router.get('/development', getDevelopment)
router.put('/development', putDevelopment)

export default router
