import Box from '@mui/material/Box'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import SpellCard from '@/components/spells/SpellCard'
import { useSpells } from '@/hooks/queries/useSpells'
import LoadFailure from '@/sharedComponents/LoadFailure'
import SectionLabel from '@/sharedComponents/SectionLabel'

/** The Overview's "Spells" section: only there while something is pinned. */
export default function PinnedSpells() {
  const { character } = useActiveCharacter()
  const spells = useSpells(character.id)

  if (spells.isError) {
    return (
      <Box sx={{ display: 'grid', gap: '10px' }}>
        <SectionLabel>Spells</SectionLabel>
        <LoadFailure
          dense
          error={spells.error}
          fallback="Could not load pinned spells."
          onRetry={() => void spells.refetch()}
        />
      </Box>
    )
  }

  const pinned = spells.data?.filter((spell) => spell.pinned) ?? []
  if (pinned.length === 0) return null

  return (
    <Box component="section" sx={{ display: 'grid', gap: '10px' }}>
      <SectionLabel>Spells</SectionLabel>
      {pinned.map((spell) => (
        <SpellCard key={spell.id} spell={spell} />
      ))}
    </Box>
  )
}
