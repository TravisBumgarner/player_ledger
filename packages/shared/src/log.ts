/** The one logging surface; Biome's `noConsole` rule forces everything through it. */

type Context = Record<string, unknown>

/** Unwraps `cause` so a wrapped error reports why, not just what failed. */
function causeChain(error: Error): { cause?: string[] } {
  const causes: string[] = []
  let current: unknown = error.cause
  while (current instanceof Error && causes.length < 5) {
    causes.push(current.message)
    current = current.cause
  }
  return causes.length ? { cause: causes } : {}
}

export const log = {
  info(message: string, context?: Context) {
    console.info(`[info] ${message}`, context ?? '')
  },

  warn(message: string, context?: Context) {
    console.warn(`[warn] ${message}`, context ?? '')
  },

  /** Always hand this an Error, not a string, so the stack survives. */
  error(error: Error | string, context?: Context) {
    const normalized = error instanceof Error ? error : new Error(error)
    // Wrapped errors put the real reason in `cause`: a Drizzle failure reports
    // "Failed query: select …" and hides the driver's message underneath.
    const enriched = { ...context, stack: normalized.stack, ...causeChain(normalized) }

    console.error(`[error] ${normalized.message}`, enriched)
  },
}
