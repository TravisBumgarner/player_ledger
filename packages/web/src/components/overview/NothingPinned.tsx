import Typography from '@mui/material/Typography'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { usePinnedCounts } from '@/hooks/queries/usePinnedCounts'

/** Only once both lists have answered: a list still loading is not a list with nothing pinned. */
export default function NothingPinned() {
  const { character } = useActiveCharacter()
  const { spells, items } = usePinnedCounts(character.id)

  if (spells !== 0 || items !== 0) return null

  return (
    <Typography variant="body1" data-empty="true">
      Nothing pinned yet.
    </Typography>
  )
}
