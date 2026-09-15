import { createCharacterSchema, createUserSchema } from '@awesomeness-mgmt/shared'
import { type Request, type Response, Router } from 'express'
import {
  findOrCreateCharacter,
  findOrCreateUser,
  findUser,
  listCharacters,
  listUsers,
  toCharacter,
  toUser,
} from '../db/queries/users.js'
import { standardRateLimit } from '../middleware/rateLimit.js'
import { sendError, sendSuccess } from './shared/responses.js'

const router: Router = Router()

router.use(standardRateLimit)

async function getUsers(_req: Request, res: Response): Promise<void> {
  const rows = await listUsers()
  sendSuccess(res, rows.map(toUser))
}

async function postUser(req: Request, res: Response): Promise<void> {
  const parsed = createUserSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toUser(await findOrCreateUser(parsed.data.name)))
}

async function getCharacters(req: Request<{ userId: string }>, res: Response): Promise<void> {
  const user = await findUser(req.params.userId)
  if (!user) return sendError(res, 'NOT_FOUND', 404)

  const rows = await listCharacters(user.id)
  sendSuccess(res, rows.map(toCharacter))
}

async function postCharacter(req: Request<{ userId: string }>, res: Response): Promise<void> {
  const parsed = createCharacterSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const user = await findUser(req.params.userId)
  if (!user) return sendError(res, 'NOT_FOUND', 404)

  sendSuccess(res, toCharacter(await findOrCreateCharacter(user.id, parsed.data.name)))
}

router.get('/', getUsers)
router.post('/', postUser)
router.get('/:userId/characters', getCharacters)
router.post('/:userId/characters', postCharacter)

export default router
