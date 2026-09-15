import type {
  CreateGoal,
  CreateSessionNote,
  Goal,
  SessionNote,
  UpdateGoal,
} from '@awesomeness-mgmt/shared'
import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '../index.js'
import { type GoalRow, goals, type SessionNoteRow, sessionNotes } from '../schema.js'

export function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    characterId: row.characterId,
    text: row.text,
    done: row.done,
    createdAt: row.createdAt.toISOString(),
  }
}

export function toSessionNote(row: SessionNoteRow): SessionNote {
  return {
    id: row.id,
    characterId: row.characterId,
    date: row.date,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  }
}

const ownedGoal = (characterId: string, goalId: string) =>
  and(eq(goals.characterId, characterId), eq(goals.id, goalId))

const ownedNote = (characterId: string, noteId: string) =>
  and(eq(sessionNotes.characterId, characterId), eq(sessionNotes.id, noteId))

export async function listGoals(characterId: string): Promise<GoalRow[]> {
  return db
    .select()
    .from(goals)
    .where(eq(goals.characterId, characterId))
    .orderBy(asc(goals.createdAt))
}

export async function createGoal(characterId: string, input: CreateGoal): Promise<GoalRow> {
  const [row] = await db.insert(goals).values({ characterId, text: input.text }).returning()
  return row
}

export async function updateGoal(
  characterId: string,
  goalId: string,
  input: UpdateGoal,
): Promise<GoalRow | undefined> {
  const [row] = await db
    .update(goals)
    .set({ done: input.done })
    .where(ownedGoal(characterId, goalId))
    .returning()
  return row
}

export async function deleteGoal(characterId: string, goalId: string): Promise<boolean> {
  const rows = await db
    .delete(goals)
    .where(ownedGoal(characterId, goalId))
    .returning({ id: goals.id })
  return rows.length > 0
}

export async function listSessionNotes(characterId: string): Promise<SessionNoteRow[]> {
  return db
    .select()
    .from(sessionNotes)
    .where(eq(sessionNotes.characterId, characterId))
    .orderBy(desc(sessionNotes.createdAt))
}

export async function createSessionNote(
  characterId: string,
  input: CreateSessionNote,
): Promise<SessionNoteRow> {
  const [row] = await db
    .insert(sessionNotes)
    .values({ characterId, date: input.date, text: input.text })
    .returning()
  return row
}

export async function deleteSessionNote(characterId: string, noteId: string): Promise<boolean> {
  const rows = await db
    .delete(sessionNotes)
    .where(ownedNote(characterId, noteId))
    .returning({ id: sessionNotes.id })
  return rows.length > 0
}
