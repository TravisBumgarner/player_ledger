import type { ErrorCode } from '@awesomeness-mgmt/shared'

/** Thrown by query hooks so react-query sees a real error, not a falsy result. */
export class ApiError extends Error {
  readonly errorCode: ErrorCode

  constructor(errorCode: ErrorCode) {
    super(errorCode)
    this.name = 'ApiError'
    this.errorCode = errorCode
  }
}
