import {
  createItemNoteSchema,
  createItemSchema,
  logItemUseSchema,
  updateItemSchema,
} from '@awesomeness-mgmt/shared'
import { type Request, type Response, Router } from 'express'
import {
  addNote,
  archiveItem,
  createItem,
  deleteItem,
  listItems,
  logUse,
  updateItem,
} from '../../db/queries/inventory.js'
import { sendError, sendSuccess } from '../shared/responses.js'
import { characterIdOf } from './scope.js'

type ItemParams = { itemId: string }

const router: Router = Router()

async function getItems(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await listItems(characterIdOf(res)))
}

async function postItem(req: Request, res: Response): Promise<void> {
  const parsed = createItemSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, await createItem(characterIdOf(res), parsed.data))
}

async function patchItem(req: Request<ItemParams>, res: Response): Promise<void> {
  const parsed = updateItemSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const item = await updateItem(characterIdOf(res), req.params.itemId, parsed.data)
  if (!item) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, item)
}

async function removeItem(req: Request<ItemParams>, res: Response): Promise<void> {
  const deleted = await deleteItem(characterIdOf(res), req.params.itemId)
  if (!deleted) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, { id: req.params.itemId })
}

async function postArchive(req: Request<ItemParams>, res: Response): Promise<void> {
  const item = await archiveItem(characterIdOf(res), req.params.itemId)
  if (!item) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, item)
}

async function postNote(req: Request<ItemParams>, res: Response): Promise<void> {
  const parsed = createItemNoteSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const item = await addNote(characterIdOf(res), req.params.itemId, parsed.data.text)
  if (!item) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, item)
}

async function postUse(req: Request<ItemParams>, res: Response): Promise<void> {
  const parsed = logItemUseSchema.safeParse(req.body ?? {})
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const result = await logUse(characterIdOf(res), req.params.itemId, parsed.data.text)
  if (result === 'NOT_FOUND') return sendError(res, 'NOT_FOUND', 404)
  if (result === 'NOT_CONSUMABLE') return sendError(res, 'INVALID_INPUT', 400)
  sendSuccess(res, result)
}

router.get('/', getItems)
router.post('/', postItem)
router.patch('/:itemId', patchItem)
router.delete('/:itemId', removeItem)
router.post('/:itemId/archive', postArchive)
router.post('/:itemId/notes', postNote)
router.post('/:itemId/use', postUse)

export default router
