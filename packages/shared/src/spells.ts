import { z } from 'zod'
import { count, longText, nameField } from './common.js'

/** A spell's slots never "reset on never" — that would be a consumable. */
export const SPELL_RESET_ON = ['short', 'long'] as const
export type SpellResetOn = (typeof SPELL_RESET_ON)[number]

export const spellSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  name: z.string(),
  level: z.number().int(),
  school: z.string(),
  description: z.string(),
  prepared: z.boolean(),
  slotsTotal: z.number().int(),
  slotsUsed: z.number().int(),
  resetOn: z.enum(SPELL_RESET_ON),
  pinned: z.boolean(),
  createdAt: z.string(),
})
export type Spell = z.infer<typeof spellSchema>

export const createSpellSchema = z.object({
  name: nameField,
  level: z.number().int().min(0).max(9),
  school: z.string().trim().max(60),
  description: longText,
  slotsTotal: count,
  resetOn: z.enum(SPELL_RESET_ON),
  prepared: z.boolean(),
})
export type CreateSpell = z.infer<typeof createSpellSchema>

export const updateSpellSchema = createSpellSchema
  .extend({ pinned: z.boolean(), slotsUsed: count })
  .partial()
export type UpdateSpell = z.infer<typeof updateSpellSchema>
