import { z } from 'zod'
import { nonEmptyRichDocSchema, type RichDoc, richDocSchema } from './richText.js'

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

/** Dated rich-text logs. One table, one form; the kind decides which page lists them. */
export const NOTE_KINDS = ['session', 'brewing'] as const
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

/** One running document per character: arc, backstory, how they have changed. */
export const characterDevelopmentSchema = z.object({
  body: z.custom<RichDoc>(),
  /** Null until the first save. */
  updatedAt: z.string().nullable(),
})
export type CharacterDevelopment = z.infer<typeof characterDevelopmentSchema>

/** Unlike a session note, this may be saved empty: clearing it is an edit. */
export const updateCharacterDevelopmentSchema = z.object({ body: richDocSchema })
export type UpdateCharacterDevelopment = z.infer<typeof updateCharacterDevelopmentSchema>
