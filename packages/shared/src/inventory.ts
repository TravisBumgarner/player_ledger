import { z } from 'zod'
import { count, nameField, RESET_ON } from './common.js'

export const ITEM_TYPES = ['gear', 'consumable'] as const
export type ItemType = (typeof ITEM_TYPES)[number]

/** Fixed, in display order. */
export const ITEM_CATEGORIES = ['consumables', 'items', 'abandoned'] as const
export type ItemCategory = (typeof ITEM_CATEGORIES)[number]

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  consumables: 'Consumables',
  items: 'Items',
  abandoned: 'Abandoned / Lost / Used',
}

export const itemNoteSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  text: z.string(),
  createdAt: z.string(),
})
export type ItemNote = z.infer<typeof itemNoteSchema>

/** One shape for both types; the fields that do not apply to a type are ignored by it. */
export const inventoryItemSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  type: z.enum(ITEM_TYPES),
  category: z.enum(ITEM_CATEGORIES),
  name: z.string(),
  pinned: z.boolean(),
  // gear
  used: z.boolean(),
  qtyTag: z.string(),
  trackedDndBeyond: z.boolean(),
  // consumable
  total: z.number().int(),
  remaining: z.number().int(),
  resetOn: z.enum(RESET_ON),
  /** Newest first. */
  notes: z.array(itemNoteSchema),
  createdAt: z.string(),
})
export type InventoryItem = z.infer<typeof inventoryItemSchema>

export const createItemSchema = z.object({
  type: z.enum(ITEM_TYPES),
  category: z.enum(ITEM_CATEGORIES),
  name: nameField,
  qtyTag: z.string().trim().max(120).default(''),
  trackedDndBeyond: z.boolean().default(false),
  total: count.default(0),
  resetOn: z.enum(RESET_ON).default('none'),
})
export type CreateItem = z.input<typeof createItemSchema>

/** Type is fixed at creation, by design. */
export const updateItemSchema = z
  .object({
    category: z.enum(ITEM_CATEGORIES),
    name: nameField,
    pinned: z.boolean(),
    used: z.boolean(),
    qtyTag: z.string().trim().max(120),
    trackedDndBeyond: z.boolean(),
    total: count,
    remaining: count,
    resetOn: z.enum(RESET_ON),
  })
  .partial()
export type UpdateItem = z.infer<typeof updateItemSchema>

export const createItemNoteSchema = z.object({ text: z.string().trim().min(1).max(1000) })
export type CreateItemNote = z.infer<typeof createItemNoteSchema>

/** Decrements remaining by one and logs a note; the text is optional flavour. */
export const logItemUseSchema = z.object({ text: z.string().trim().max(1000).default('') })
export type LogItemUse = z.input<typeof logItemUseSchema>
