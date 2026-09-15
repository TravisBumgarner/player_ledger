import { Router } from 'express'
import { standardRateLimit } from '../../middleware/rateLimit.js'
import brewingRouter from './brewing.js'
import inventoryRouter from './inventory.js'
import journalRouter from './journal.js'
import profilesRouter from './profiles.js'
import restRouter from './rest.js'
import { requireCharacter } from './scope.js'
import spellsRouter from './spells.js'

// Mounted at /api/characters/:characterId.
const router: Router = Router({ mergeParams: true })

router.use(standardRateLimit)
router.use(requireCharacter)

router.use('/rest', restRouter)
router.use('/spells', spellsRouter)
router.use('/inventory', inventoryRouter)
router.use('/brewing', brewingRouter)
router.use('/profiles', profilesRouter)
router.use('/', journalRouter)

export default router
