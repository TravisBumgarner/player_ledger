import { randomUUID } from 'node:crypto'
import {
  ITEM_CATEGORIES,
  ITEM_TYPES,
  RARITIES,
  RESET_ON,
  SPELL_RESET_ON,
} from '@awesomeness-mgmt/shared'
import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// Milliseconds, not SQLite's default seconds: two rows created in the same
// second would otherwise tie in newest-first order.
const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(unixepoch('subsec') * 1000 as integer))`)

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID())

const characterId = () =>
  text('character_id')
    .notNull()
    .references(() => characters.id, { onDelete: 'cascade' })

const bool = (name: string) => integer(name, { mode: 'boolean' }).notNull().default(false)

// Names are the identity until there is a login, so they are unique ignoring case:
// "Travis" and "travis" typed on two devices must land on the same person.
export const users = sqliteTable(
  'users',
  {
    id: id(),
    name: text('name').notNull(),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex('users_name_lower_idx').on(sql`lower(${table.name})`)],
)

export type UserRow = typeof users.$inferSelect

export const characters = sqliteTable(
  'characters',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('characters_user_name_lower_idx').on(table.userId, sql`lower(${table.name})`),
  ],
)

export type CharacterRow = typeof characters.$inferSelect

export const restStates = sqliteTable('rest_states', {
  characterId: text('character_id')
    .primaryKey()
    .references(() => characters.id, { onDelete: 'cascade' }),
  shortRests: integer('short_rests').notNull().default(0),
  longRests: integer('long_rests').notNull().default(0),
})

export type RestStateRow = typeof restStates.$inferSelect

export const spells = sqliteTable(
  'spells',
  {
    id: id(),
    characterId: characterId(),
    name: text('name').notNull(),
    level: integer('level').notNull().default(0),
    school: text('school').notNull().default(''),
    description: text('description').notNull().default(''),
    prepared: bool('prepared'),
    slotsTotal: integer('slots_total').notNull().default(0),
    slotsUsed: integer('slots_used').notNull().default(0),
    resetOn: text('reset_on', { enum: SPELL_RESET_ON }).notNull().default('long'),
    pinned: bool('pinned'),
    createdAt: createdAt(),
  },
  (table) => [index('spells_character_idx').on(table.characterId, table.createdAt)],
)

export type SpellRow = typeof spells.$inferSelect

export const inventoryItems = sqliteTable(
  'inventory_items',
  {
    id: id(),
    characterId: characterId(),
    type: text('type', { enum: ITEM_TYPES }).notNull(),
    category: text('category', { enum: ITEM_CATEGORIES }).notNull(),
    name: text('name').notNull(),
    pinned: bool('pinned'),
    used: bool('used'),
    qtyTag: text('qty_tag').notNull().default(''),
    trackedDndBeyond: bool('tracked_dnd_beyond'),
    total: integer('total').notNull().default(0),
    remaining: integer('remaining').notNull().default(0),
    resetOn: text('reset_on', { enum: RESET_ON }).notNull().default('none'),
    createdAt: createdAt(),
  },
  (table) => [index('inventory_items_character_idx').on(table.characterId, table.createdAt)],
)

export type InventoryItemRow = typeof inventoryItems.$inferSelect

export const inventoryNotes = sqliteTable(
  'inventory_notes',
  {
    id: id(),
    itemId: text('item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    createdAt: createdAt(),
  },
  (table) => [index('inventory_notes_item_idx').on(table.itemId, table.createdAt)],
)

export type InventoryNoteRow = typeof inventoryNotes.$inferSelect

export const recipes = sqliteTable(
  'recipes',
  {
    id: id(),
    characterId: characterId(),
    name: text('name').notNull(),
    rarity: text('rarity', { enum: RARITIES }).notNull(),
    known: bool('known'),
    ingredients: text('ingredients').notNull().default(''),
    description: text('description').notNull().default(''),
    createdAt: createdAt(),
  },
  (table) => [index('recipes_character_idx').on(table.characterId, table.createdAt)],
)

export type RecipeRow = typeof recipes.$inferSelect

export const ingredients = sqliteTable(
  'ingredients',
  {
    id: id(),
    characterId: characterId(),
    name: text('name').notNull(),
    rarity: text('rarity', { enum: RARITIES }).notNull(),
    qty: integer('qty').notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [index('ingredients_character_idx').on(table.characterId, table.createdAt)],
)

export type IngredientRow = typeof ingredients.$inferSelect

/** One row per character, created on first read. A null brew name means nothing is brewing. */
export const brewingStates = sqliteTable('brewing_states', {
  characterId: text('character_id')
    .primaryKey()
    .references(() => characters.id, { onDelete: 'cascade' }),
  level: integer('level').notNull().default(1),
  exp: integer('exp').notNull().default(0),
  expAtLevel: integer('exp_at_level').notNull().default(0),
  expToNext: integer('exp_to_next').notNull().default(100),
  brewName: text('brew_name'),
  brewRarity: text('brew_rarity', { enum: RARITIES }),
  brewHoursLogged: integer('brew_hours_logged').notNull().default(0),
  brewHoursTotal: integer('brew_hours_total').notNull().default(0),
  brewGold: integer('brew_gold').notNull().default(0),
})

export type BrewingStateRow = typeof brewingStates.$inferSelect

export const goals = sqliteTable(
  'goals',
  {
    id: id(),
    characterId: characterId(),
    text: text('text').notNull(),
    done: bool('done'),
    createdAt: createdAt(),
  },
  (table) => [index('goals_character_idx').on(table.characterId, table.createdAt)],
)

export type GoalRow = typeof goals.$inferSelect

export const sessionNotes = sqliteTable(
  'session_notes',
  {
    id: id(),
    characterId: characterId(),
    date: text('date').notNull(),
    text: text('text').notNull(),
    createdAt: createdAt(),
  },
  (table) => [index('session_notes_character_idx').on(table.characterId, table.createdAt)],
)

export type SessionNoteRow = typeof sessionNotes.$inferSelect
