import {
  createNpcSchema,
  PROFILE_IMAGE_MAX_BYTES,
  type ProfileImageType,
  type ProfileRef,
  parseProfileRef,
  updateProfileSchema,
} from '@awesomeness-mgmt/shared'
import express, { type Request, type Response, Router } from 'express'
import {
  createNpc,
  deleteNpc,
  getProfileImage,
  listBacklinks,
  listProfiles,
  setProfileImage,
  updateNpc,
  upsertPartyProfile,
} from '../../db/queries/profiles.js'
import { sendError, sendSuccess } from '../shared/responses.js'
import { characterIdOf } from './scope.js'

// Mounted at /api/characters/:characterId/profiles.
const router: Router = Router()

type RefParams = { ref: string }

async function getProfiles(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await listProfiles(characterIdOf(res)))
}

async function postNpc(req: Request, res: Response): Promise<void> {
  const parsed = createNpcSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, await createNpc(characterIdOf(res), parsed.data), 201)
}

async function patchProfile(req: Request<RefParams>, res: Response): Promise<void> {
  const ref = parseProfileRef(req.params.ref)
  const parsed = updateProfileSchema.safeParse(req.body)
  if (!ref || !parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const ledgerId = characterIdOf(res)
  if (ref.kind === 'pc') {
    // A party member's name belongs to whoever plays them.
    if (parsed.data.name !== undefined) return sendError(res, 'INVALID_INPUT', 400)
    const profile = await upsertPartyProfile(ledgerId, ref.id, parsed.data)
    if (!profile) return sendError(res, 'NOT_FOUND', 404)
    return sendSuccess(res, profile)
  }

  const profile = await updateNpc(ledgerId, ref.id, parsed.data)
  if (!profile) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, profile)
}

async function removeProfile(req: Request<RefParams>, res: Response): Promise<void> {
  const ref = parseProfileRef(req.params.ref)
  if (ref?.kind !== 'npc') return sendError(res, 'INVALID_INPUT', 400)

  const deleted = await deleteNpc(characterIdOf(res), ref.id)
  if (!deleted) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, { ref: req.params.ref })
}

async function getBacklinks(req: Request<RefParams>, res: Response): Promise<void> {
  if (!parseProfileRef(req.params.ref)) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, await listBacklinks(characterIdOf(res), req.params.ref as ProfileRef))
}

/** The declared type is not trusted: the first bytes decide what this is. */
function sniffImageType(bytes: Buffer): ProfileImageType | null {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'image/png'
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'image/webp'
  if (bytes.subarray(0, 4).toString('ascii') === 'GIF8') return 'image/gif'
  return null
}

async function putImage(req: Request<RefParams>, res: Response): Promise<void> {
  const ref = parseProfileRef(req.params.ref)
  const bytes = Buffer.isBuffer(req.body) ? req.body : null
  const type = bytes ? sniffImageType(bytes) : null
  if (!ref || !bytes || !type) return sendError(res, 'INVALID_INPUT', 400)

  const profile = await setProfileImage(characterIdOf(res), req.params.ref as ProfileRef, {
    bytes,
    type,
  })
  if (!profile) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, profile)
}

async function removeImage(req: Request<RefParams>, res: Response): Promise<void> {
  if (!parseProfileRef(req.params.ref)) return sendError(res, 'INVALID_INPUT', 400)

  const profile = await setProfileImage(characterIdOf(res), req.params.ref as ProfileRef, null)
  if (!profile) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, profile)
}

async function getImage(req: Request<RefParams>, res: Response): Promise<void> {
  if (!parseProfileRef(req.params.ref)) return sendError(res, 'INVALID_INPUT', 400)

  const image = await getProfileImage(characterIdOf(res), req.params.ref as ProfileRef)
  if (!image) return sendError(res, 'NOT_FOUND', 404)
  // Versioned URL (`?v=`), so a changed portrait is a new URL and this one never goes stale.
  res.set('Cache-Control', 'private, max-age=31536000, immutable')
  res.type(image.type).send(image.bytes)
}

router.get('/', getProfiles)
router.post('/', postNpc)
router.patch('/:ref', patchProfile)
router.delete('/:ref', removeProfile)
router.get('/:ref/backlinks', getBacklinks)
router.get('/:ref/image', getImage)
router.put(
  '/:ref/image',
  express.raw({ type: 'image/*', limit: PROFILE_IMAGE_MAX_BYTES }),
  putImage,
)
router.delete('/:ref/image', removeImage)

export default router
