import { z } from 'zod'

export const RESET_ON = ['none', 'short', 'long'] as const
export type ResetOn = (typeof RESET_ON)[number]

export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare'] as const
export type Rarity = (typeof RARITIES)[number]

export const nameField = z.string().trim().min(1).max(120)
export const longText = z.string().max(5000)
export const count = z.number().int().min(0).max(100_000)
