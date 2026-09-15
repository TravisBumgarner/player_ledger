import type { CreateSpell, Spell, UpdateSpell } from '@awesomeness-mgmt/shared'
import { and, asc, eq, sql } from 'drizzle-orm'
import { db } from '../index.js'
import { type SpellRow, spells } from '../schema.js'

export function toSpell(row: SpellRow): Spell {
  return {
    id: row.id,
    characterId: row.characterId,
    name: row.name,
    level: row.level,
    school: row.school,
    description: row.description,
    prepared: row.prepared,
    slotsTotal: row.slotsTotal,
    slotsUsed: row.slotsUsed,
    resetOn: row.resetOn,
    pinned: row.pinned,
    createdAt: row.createdAt.toISOString(),
  }
}

const owned = (characterId: string, spellId: string) =>
  and(eq(spells.characterId, characterId), eq(spells.id, spellId))

export async function listSpells(characterId: string): Promise<SpellRow[]> {
  return db
    .select()
    .from(spells)
    .where(eq(spells.characterId, characterId))
    .orderBy(asc(spells.createdAt))
}

export async function createSpell(characterId: string, input: CreateSpell): Promise<SpellRow> {
  const [row] = await db
    .insert(spells)
    .values({ characterId, ...input })
    .returning()
  return row
}

export async function updateSpell(
  characterId: string,
  spellId: string,
  input: UpdateSpell,
): Promise<SpellRow | undefined> {
  // Inside SET every column reads its pre-update value, so a total changing in
  // this same statement has to be the literal rather than the column.
  const used = input.slotsUsed ?? sql`${spells.slotsUsed}`
  const total = input.slotsTotal ?? sql`${spells.slotsTotal}`

  const [row] = await db
    .update(spells)
    .set({ ...input, slotsUsed: sql`max(0, min(${used}, ${total}))` })
    .where(owned(characterId, spellId))
    .returning()
  return row
}

export async function deleteSpell(characterId: string, spellId: string): Promise<boolean> {
  const rows = await db
    .delete(spells)
    .where(owned(characterId, spellId))
    .returning({ id: spells.id })
  return rows.length > 0
}

export async function castSpell(
  characterId: string,
  spellId: string,
): Promise<SpellRow | undefined> {
  const [row] = await db
    .update(spells)
    .set({ slotsUsed: sql`min(${spells.slotsTotal}, ${spells.slotsUsed} + 1)` })
    .where(owned(characterId, spellId))
    .returning()
  return row
}
