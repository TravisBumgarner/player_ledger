import { z } from 'zod'
import { nonEmptyRichDocSchema, type RichDoc } from './richText.js'

export const goalSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  text: z.string(),
  done: z.boolean(),
  createdAt: z.string(),
})
export type Goal = z.infer<typeof goalSchema>

export const createGoalSchema = z.object({ text: z.string().trim().min(1).max(500) })
export type CreateGoal = z.infer<typeof createGoalSchema>

export const updateGoalSchema = z.object({ done: z.boolean() })
export type UpdateGoal = z.infer<typeof updateGoalSchema>

/** A condition in effect right now — "Blessed", "-2 AC until dawn". */
export const modifierSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  text: z.string(),
  createdAt: z.string(),
})
export type Modifier = z.infer<typeof modifierSchema>

export const createModifierSchema = z.object({ text: z.string().trim().min(1).max(200) })
export type CreateModifier = z.infer<typeof createModifierSchema>

export const updateModifierSchema = createModifierSchema
export type UpdateModifier = CreateModifier

/** Dated rich-text logs. One table, one form; the kind decides which page lists them. */
export const NOTE_KINDS = ['session', 'brewing', 'grafting', 'development'] as const
export type NoteKind = (typeof NOTE_KINDS)[number]

export const sessionNoteSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  kind: z.enum(NOTE_KINDS),
  /** Free text: "Session 12", "Sep 14". The form starts it at today. */
  date: z.string(),
  body: z.custom<RichDoc>(),
  createdAt: z.string(),
})
export type SessionNote = z.infer<typeof sessionNoteSchema>

export const createSessionNoteSchema = z.object({
  date: z.string().trim().min(1).max(80),
  body: nonEmptyRichDocSchema,
})
export type CreateSessionNote = z.infer<typeof createSessionNoteSchema>

/** A note is edited whole: the date and the document are saved together. */
export const updateSessionNoteSchema = createSessionNoteSchema
export type UpdateSessionNote = CreateSessionNote
