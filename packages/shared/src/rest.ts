import { z } from 'zod'
import { count } from './common.js'

export const REST_KINDS = ['short', 'long'] as const
export type RestKind = (typeof REST_KINDS)[number]

export const restStateSchema = z.object({ shortRests: count, longRests: count })
export type RestState = z.infer<typeof restStateSchema>

export const takeRestSchema = z.object({ kind: z.enum(REST_KINDS) })
export type TakeRest = z.infer<typeof takeRestSchema>
