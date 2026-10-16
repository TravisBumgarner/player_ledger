import type { RestKind, RestState } from '@player-ledger/shared'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../index.js'
import { inventoryItems, type RestStateRow, restStates, spells } from '../schema.js'

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export function toRestState(row: RestStateRow): RestState {
  return { shortRests: row.shortRests, longRests: row.longRests }
}

/** A character has no row until something reads it; two first reads must not collide. */
function ensureRow(tx: Tx | typeof db, characterId: string): void {
  tx.insert(restStates).values({ characterId }).onConflictDoNothing().run()
}

export async function getRestState(characterId: string): Promise<RestStateRow> {
  return db.transaction((tx) => {
    ensureRow(tx, characterId)
    return tx.select().from(restStates).where(eq(restStates.characterId, characterId)).get()
  }) as RestStateRow
}

export async function takeRest(characterId: string, kind: RestKind): Promise<RestStateRow> {
  // A long rest also restores what a short one would.
  const refills = kind === 'short' ? (['short'] as const) : (['short', 'long'] as const)

  return db.transaction((tx) => {
    ensureRow(tx, characterId)

    tx.update(restStates)
      .set(
        kind === 'short'
          ? { shortRests: sql`${restStates.shortRests} + 1` }
          : { shortRests: 0, longRests: sql`${restStates.longRests} + 1` },
      )
      .where(eq(restStates.characterId, characterId))
      .run()

    tx.update(spells)
      .set({ slotsUsed: 0 })
      .where(and(eq(spells.characterId, characterId), inArray(spells.resetOn, [...refills])))
      .run()

    tx.update(inventoryItems)
      .set({ remaining: sql`${inventoryItems.total}` })
      .where(
        and(
          eq(inventoryItems.characterId, characterId),
          eq(inventoryItems.type, 'consumable'),
          inArray(inventoryItems.resetOn, [...refills]),
        ),
      )
      .run()

    return tx.select().from(restStates).where(eq(restStates.characterId, characterId)).get()
  }) as RestStateRow
}
