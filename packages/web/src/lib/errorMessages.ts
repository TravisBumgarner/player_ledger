import type { ErrorCode } from '@awesomeness-mgmt/shared'
import { ApiError } from '@/lib/ApiError'

/** Codes are the contract; messages are ours. */
const MESSAGES: Partial<Record<ErrorCode, string>> = {
  INVALID_INPUT: 'That does not look right. Check the details and try again.',
  NOT_FOUND: 'That is no longer there — someone may have changed it already.',
  RATE_LIMITED: 'That is a lot of requests at once. Try again in a little while.',
}

export function errorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.errorCode : null
  return (code && MESSAGES[code]) || 'Something went wrong. Try again.'
}
