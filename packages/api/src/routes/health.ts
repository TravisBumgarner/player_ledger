import type { Health } from '@awesomeness-mgmt/shared'
import { Router } from 'express'
import { sendSuccess } from './shared/responses.js'

const router: Router = Router()

// Mounted before rate limits so probes always reach it.
router.get('/', (_req, res) => {
  sendSuccess<Health>(res, { status: 'ok' })
})

export default router
