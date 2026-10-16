import type { InventoryItem, ItemNote, UpdateItem } from '@player-ledger/shared'
import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '../index.js'
import {
  type InventoryItemRow,
  type InventoryNoteRow,
  inventoryItems,
  inventoryNotes,
} from '../schema.js'

type NewItem = {
  type: InventoryItemRow['type']
  category: InventoryItemRow['category']
  name: string
  qtyTag: string
  trackedDndBeyond: boolean
  total: number
  resetOn: InventoryItemRow['resetOn']
}

function toNote(row: InventoryNoteRow): ItemNote {
  return { id: row.id, itemId: row.itemId, text: row.text, createdAt: row.createdAt.toISOString() }
}

function toItem(row: InventoryItemRow, notes: InventoryNoteRow[]): InventoryItem {
  return {
    id: row.id,
    characterId: row.characterId,
    type: row.type,
    category: row.category,
    name: row.name,
    used: row.used,
    qtyTag: row.qtyTag,
    trackedDndBeyond: row.trackedDndBeyond,
    total: row.total,
    remaining: row.remaining,
    resetOn: row.resetOn,
    notes: notes.map(toNote),
    createdAt: row.createdAt.toISOString(),
  }
}

function findRow(characterId: string, itemId: string): InventoryItemRow | undefined {
  return db
    .select()
    .from(inventoryItems)
    .where(and(eq(inventoryItems.id, itemId), eq(inventoryItems.characterId, characterId)))
    .get()
}

function withNotes(row: InventoryItemRow): InventoryItem {
  const notes = db
    .select()
    .from(inventoryNotes)
    .where(eq(inventoryNotes.itemId, row.id))
    .orderBy(desc(inventoryNotes.createdAt))
    .all()
  return toItem(row, notes)
}

export async function listItems(characterId: string): Promise<InventoryItem[]> {
  const items = db
    .select()
    .from(inventoryItems)
    .where(eq(inventoryItems.characterId, characterId))
    .orderBy(asc(inventoryItems.createdAt))
    .all()

  const notes = db
    .select({ note: inventoryNotes })
    .from(inventoryNotes)
    .innerJoin(inventoryItems, eq(inventoryNotes.itemId, inventoryItems.id))
    .where(eq(inventoryItems.characterId, characterId))
    .orderBy(desc(inventoryNotes.createdAt))
    .all()

  const byItem = new Map<string, InventoryNoteRow[]>()
  for (const { note } of notes) {
    const list = byItem.get(note.itemId) ?? []
    list.push(note)
    byItem.set(note.itemId, list)
  }

  return items.map((row) => toItem(row, byItem.get(row.id) ?? []))
}

export async function createItem(characterId: string, input: NewItem): Promise<InventoryItem> {
  const consumable = input.type === 'consumable'
  const row = db
    .insert(inventoryItems)
    .values({
      characterId,
      type: input.type,
      category: input.category,
      name: input.name,
      qtyTag: consumable ? '' : input.qtyTag,
      trackedDndBeyond: consumable ? false : input.trackedDndBeyond,
      total: consumable ? input.total : 0,
      remaining: consumable ? input.total : 0,
      resetOn: consumable ? input.resetOn : 'none',
    })
    .returning()
    .get()
  return toItem(row, [])
}

export async function updateItem(
  characterId: string,
  itemId: string,
  patch: UpdateItem,
): Promise<InventoryItem | undefined> {
  const row = findRow(characterId, itemId)
  if (!row) return undefined

  const { total, remaining, resetOn, qtyTag, trackedDndBeyond, ...common } = patch
  const values: Partial<InventoryItemRow> = { ...common }

  if (row.type === 'consumable') {
    const nextTotal = total ?? row.total
    values.total = nextTotal
    values.remaining = Math.min(remaining ?? row.remaining, nextTotal)
    if (resetOn !== undefined) values.resetOn = resetOn
  } else {
    if (qtyTag !== undefined) values.qtyTag = qtyTag
    if (trackedDndBeyond !== undefined) values.trackedDndBeyond = trackedDndBeyond
  }

  const updated = db
    .update(inventoryItems)
    .set(values)
    .where(and(eq(inventoryItems.id, itemId), eq(inventoryItems.characterId, characterId)))
    .returning()
    .get()
  return withNotes(updated)
}

export async function deleteItem(characterId: string, itemId: string): Promise<boolean> {
  const result = db
    .delete(inventoryItems)
    .where(and(eq(inventoryItems.id, itemId), eq(inventoryItems.characterId, characterId)))
    .run()
  return result.changes > 0
}

export async function archiveItem(
  characterId: string,
  itemId: string,
): Promise<InventoryItem | undefined> {
  return updateItem(characterId, itemId, { category: 'abandoned', used: true })
}

export async function addNote(
  characterId: string,
  itemId: string,
  text: string,
): Promise<InventoryItem | undefined> {
  const row = findRow(characterId, itemId)
  if (!row) return undefined

  db.insert(inventoryNotes).values({ itemId, text }).run()
  return withNotes(row)
}

/** The date prefix is the client's to render, from the note's createdAt. */
function usedNoteText(text: string): string {
  return text ? `used 1 — ${text}` : 'used 1'
}

export async function logUse(
  characterId: string,
  itemId: string,
  text: string,
): Promise<InventoryItem | 'NOT_FOUND' | 'NOT_CONSUMABLE'> {
  return db.transaction((tx) => {
    const row = tx
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.id, itemId), eq(inventoryItems.characterId, characterId)))
      .get()
    if (!row) return 'NOT_FOUND' as const
    if (row.type !== 'consumable') return 'NOT_CONSUMABLE' as const

    const updated = tx
      .update(inventoryItems)
      .set({ remaining: Math.max(0, row.remaining - 1) })
      .where(eq(inventoryItems.id, itemId))
      .returning()
      .get()
    tx.insert(inventoryNotes)
      .values({ itemId, text: usedNoteText(text) })
      .run()
    return withNotes(updated)
  })
}
