import { log } from '@player-ledger/shared'
import app from './app.js'
import config from './config.js'
import { sqlite } from './db/index.js'

const server = app.listen(config.port, () => {
  log.info(`API server running on port ${config.port}`, { nodeEnv: config.nodeEnv })
})

function shutdown(signal: string) {
  log.info(`Received ${signal}, shutting down gracefully`)
  server.close(() => {
    // After the server: an in-flight request may still be writing.
    sqlite.close()
    process.exit(0)
  })
  // Unreffed so it cannot hold the event loop open on a clean exit.
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('uncaughtException', (error) => {
  log.error(error, { source: 'uncaughtException' })
  shutdown('uncaughtException')
})
process.on('unhandledRejection', (reason) => {
  log.error(new Error(String(reason)), { source: 'unhandledRejection' })
})
