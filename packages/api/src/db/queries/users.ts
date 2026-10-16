import type { Character, User } from '@awesomeness-mgmt/shared'
import { and, asc, eq, sql } from 'drizzle-orm'
import { db } from '../index.js'
import { type CharacterRow, characters, type UserRow, users } from '../schema.js'

export function toUser(row: UserRow): User {
  return { id: row.id, name: row.name, createdAt: row.createdAt.toISOString() }
}

export function toCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listUsers(): Promise<UserRow[]> {
  return db
    .select()
    .from(users)
    .orderBy(asc(sql`lower(${users.name})`))
}

export async function findUser(id: string): Promise<UserRow | undefined> {
  const [row] = await db.select().from(users).where(eq(users.id, id))
  return row
}

/** Typing a name that exists picks that person rather than failing on the unique index. */
export async function findOrCreateUser(name: string): Promise<UserRow> {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(sql`lower(${users.name})`, name.toLowerCase()))
  if (existing) return existing

  const [row] = await db.insert(users).values({ name }).returning()
  return row
}

export async function listCharacters(userId: string): Promise<CharacterRow[]> {
  return db
    .select()
    .from(characters)
    .where(eq(characters.userId, userId))
    .orderBy(asc(sql`lower(${characters.name})`))
}

export async function findOrCreateCharacter(userId: string, name: string): Promise<CharacterRow> {
  const [existing] = await db
    .select()
    .from(characters)
    .where(
      and(eq(characters.userId, userId), eq(sql`lower(${characters.name})`, name.toLowerCase())),
    )
  if (existing) return existing

  const [row] = await db.insert(characters).values({ userId, name }).returning()
  return row
}

/** Null when the user already has a character by that name (the names are unique, ignoring case). */
export async function renameCharacter(
  userId: string,
  id: string,
  name: string,
): Promise<CharacterRow | null | undefined> {
  const [clash] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(
      and(eq(characters.userId, userId), eq(sql`lower(${characters.name})`, name.toLowerCase())),
    )
  if (clash && clash.id !== id) return null
  const [row] = await db
    .update(characters)
    .set({ name })
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .returning()
  return row
}

export async function findCharacter(id: string): Promise<CharacterRow | undefined> {
  const [row] = await db.select().from(characters).where(eq(characters.id, id))
  return row
}
