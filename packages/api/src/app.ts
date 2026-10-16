import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { log } from '@awesomeness-mgmt/shared'
import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import config from './config.js'
import backupRouter from './routes/backup.js'
import charactersRouter from './routes/characters/index.js'
import healthRouter from './routes/health.js'
import { sendError } from './routes/shared/responses.js'
import usersRouter from './routes/users.js'

// Separate from index.ts so a test can import the app without binding a port.
const app = express()

// Set 'trust proxy' to the real hop count once this sits behind one. Too high
// lets a client spoof X-Forwarded-For and defeat the IP rate limits.
app.disable('x-powered-by')

// Before every gate below, so probes never 429.
app.use('/api/health', healthRouter)

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        fontSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:', 'wss:'],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        // Otherwise every asset URL on http://localhost is rewritten to https.
        upgradeInsecureRequests: config.isProduction && !config.isDesktop ? [] : null,
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(
  cors({
    origin: [config.frontendUrl],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
)

app.use(express.json({ limit: '1mb' }))

app.use('/api/characters/:characterId', charactersRouter)
app.use('/api/users', usersRouter)
app.use('/api/backup', backupRouter)

app.use('/api', (_req, res) => {
  sendError(res, 'NOT_FOUND', 404)
})

// One process serves both in production, so there is no CORS and no second
// host. The web build sits at the same relative path from src/ and dist/.
if (config.isProduction) {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const frontendDist = path.resolve(here, '..', '..', 'web', 'dist')

  app.use('/assets', express.static(path.join(frontendDist, 'assets')))
  // index: false — otherwise static serving answers '/' before the catch-all.
  app.use(express.static(frontendDist, { index: false }))

  // Match only non-file routes, so a missing asset 404s instead of returning HTML.
  app.get(/^\/(?!.*\.[a-zA-Z0-9]+$).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

// Last, after every route including the catch-all.
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500
  if (status >= 500) {
    log.error(err instanceof Error ? err : new Error(String(err)), {
      route: `${req.method} ${req.path}`,
    })
  }
  // A partially written response must be delegated, not rewritten.
  if (res.headersSent) return next(err)

  if (config.isProduction) {
    sendError(res, status >= 500 ? 'INTERNAL_ERROR' : 'INVALID_INPUT', status)
  } else {
    res.status(status).json({ error: err.message, stack: err.stack })
  }
}
app.use(errorHandler)

export { app }
export default app
