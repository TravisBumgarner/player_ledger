import { z } from 'zod'

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

export const sessionNoteSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  /** Free text: "Session 12", "Sep 14". The client fills in today when left blank. */
  date: z.string(),
  text: z.string(),
  createdAt: z.string(),
})
export type SessionNote = z.infer<typeof sessionNoteSchema>

export const createSessionNoteSchema = z.object({
  date: z.string().trim().min(1).max(80),
  text: z.string().trim().min(1).max(20_000),
})
export type CreateSessionNote = z.infer<typeof createSessionNoteSchema>
