import type {
  CreateGoal,
  CreateModifier,
  CreateSessionNote,
  Goal,
  Modifier,
  NoteKind,
  SessionNote,
  UpdateGoal,
  UpdateModifier,
  UpdateSessionNote,
} from '@player-ledger/shared'
import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '../index.js'
import {
  type GoalRow,
  goals,
  type ModifierRow,
  modifiers,
  type SessionNoteRow,
  sessionNotes,
} from '../schema.js'

export function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    characterId: row.characterId,
    text: row.text,
    done: row.done,
    createdAt: row.createdAt.toISOString(),
  }
}

export function toModifier(row: ModifierRow): Modifier {
  return {
    id: row.id,
    characterId: row.characterId,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  }
}

export function toSessionNote(row: SessionNoteRow): SessionNote {
  return {
    id: row.id,
    characterId: row.characterId,
    kind: row.kind,
    date: row.date,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  }
}

const ownedGoal = (characterId: string, goalId: string) =>
  and(eq(goals.characterId, characterId), eq(goals.id, goalId))

const ownedModifier = (characterId: string, modifierId: string) =>
  and(eq(modifiers.characterId, characterId), eq(modifiers.id, modifierId))

const ownedNote = (characterId: string, kind: NoteKind, noteId: string) =>
  and(
    eq(sessionNotes.characterId, characterId),
    eq(sessionNotes.kind, kind),
    eq(sessionNotes.id, noteId),
  )

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

export async function listModifiers(characterId: string): Promise<ModifierRow[]> {
  return db
    .select()
    .from(modifiers)
    .where(eq(modifiers.characterId, characterId))
    .orderBy(asc(modifiers.createdAt))
}

export async function createModifier(
  characterId: string,
  input: CreateModifier,
): Promise<ModifierRow> {
  const [row] = await db.insert(modifiers).values({ characterId, text: input.text }).returning()
  return row
}

export async function updateModifier(
  characterId: string,
  modifierId: string,
  input: UpdateModifier,
): Promise<ModifierRow | undefined> {
  const [row] = await db
    .update(modifiers)
    .set({ text: input.text })
    .where(ownedModifier(characterId, modifierId))
    .returning()
  return row
}

export async function deleteModifier(characterId: string, modifierId: string): Promise<boolean> {
  const rows = await db
    .delete(modifiers)
    .where(ownedModifier(characterId, modifierId))
    .returning({ id: modifiers.id })
  return rows.length > 0
}

export async function listSessionNotes(
  characterId: string,
  kind: NoteKind,
): Promise<SessionNoteRow[]> {
  return db
    .select()
    .from(sessionNotes)
    .where(and(eq(sessionNotes.characterId, characterId), eq(sessionNotes.kind, kind)))
    .orderBy(desc(sessionNotes.createdAt))
}

export async function createSessionNote(
  characterId: string,
  kind: NoteKind,
  input: CreateSessionNote,
): Promise<SessionNoteRow> {
  const [row] = await db
    .insert(sessionNotes)
    .values({ characterId, kind, date: input.date, body: input.body })
    .returning()
  return row
}

export async function updateSessionNote(
  characterId: string,
  kind: NoteKind,
  noteId: string,
  input: UpdateSessionNote,
): Promise<SessionNoteRow | undefined> {
  const [row] = await db
    .update(sessionNotes)
    .set({ date: input.date, body: input.body })
    .where(ownedNote(characterId, kind, noteId))
    .returning()
  return row
}

export async function deleteSessionNote(
  characterId: string,
  kind: NoteKind,
  noteId: string,
): Promise<boolean> {
  const rows = await db
    .delete(sessionNotes)
    .where(ownedNote(characterId, kind, noteId))
    .returning({ id: sessionNotes.id })
  return rows.length > 0
}
