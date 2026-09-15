import { z } from 'zod'

/** Error responses carry a stable code, never a message: messages leak internals. */
export const ERROR_CODES = ['INTERNAL_ERROR', 'INVALID_INPUT', 'NOT_FOUND', 'RATE_LIMITED'] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

export type ApiResponse<T> = { success: true; data: T } | { success: false; errorCode: ErrorCode }

/** Wraps a payload schema in the response envelope, for parsing on the client. */
export function apiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion('success', [
    z.object({ success: z.literal(true), data: dataSchema }),
    z.object({ success: z.literal(false), errorCode: z.enum(ERROR_CODES) }),
  ])
}

export const healthSchema = z.object({ status: z.literal('ok') })

export type Health = z.infer<typeof healthSchema>
