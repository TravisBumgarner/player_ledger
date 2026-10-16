import { log } from '@player-ledger/shared'
import type { Request } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

/** `ipKeyGenerator` normalizes IPv6: a raw `req.ip` lets a client rotate through a /64. */
function ipKey(req: Request): string {
  return ipKeyGenerator(req.ip ?? '')
}

function tier(name: string, windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: ipKey,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      // A limit you can't see firing is a limit you can't tune.
      log.info(`[rate-limit] ${name} limit hit`, { path: req.originalUrl, ip: req.ip })
      res.status(429).json({ success: false, errorCode: 'RATE_LIMITED' })
    },
  })
}

export const standardRateLimit = tier('standard', 60_000, 300)

export const expensiveRateLimit = tier('expensive', 60_000, 30)
