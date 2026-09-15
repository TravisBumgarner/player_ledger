import { useInventory } from '@/hooks/queries/useInventory'
import { useSpells } from '@/hooks/queries/useSpells'

/** Undefined until the list has loaded, so a list still loading never reads as "nothing pinned". */
export function usePinnedCounts(characterId: string) {
  const spells = useSpells(characterId)
  const items = useInventory(characterId)

  return {
    spells: spells.data?.filter((row) => row.pinned).length,
    items: items.data?.filter((row) => row.pinned).length,
  }
}
