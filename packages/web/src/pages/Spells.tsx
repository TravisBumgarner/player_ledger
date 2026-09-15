import type { Spell } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import SpellCard from '@/components/spells/SpellCard'
import SpellFormDialog from '@/components/spells/SpellFormDialog'
import { useSpells } from '@/hooks/queries/useSpells'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import NoData from '@/sharedComponents/NoData'

export default function Spells() {
  const { character } = useActiveCharacter()
  const spells = useSpells(character.id)
  const [dialogOpen, setDialogOpen] = useState(false)
  // Kept after closing, so the dialog does not retitle itself while it fades out.
  const [editing, setEditing] = useState<Spell | null>(null)

  function openDialog(spell: Spell | null) {
    setEditing(spell)
    setDialogOpen(true)
  }

  function renderBody() {
    if (spells.isPending) return <Loading label="Loading spells" />
    if (spells.isError) {
      return (
        <LoadFailure
          error={spells.error}
          fallback="Could not load spells."
          onRetry={() => void spells.refetch()}
        />
      )
    }
    if (spells.data.length === 0) return <NoData message="No spells yet." />

    return (
      <Box sx={{ display: 'grid', gap: '14px' }}>
        {spells.data.map((spell) => (
          <SpellCard key={spell.id} spell={spell} onEdit={() => openDialog(spell)} />
        ))}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: '18px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => openDialog(null)}>
          + Add Spell
        </Button>
      </Box>

      {renderBody()}

      <SpellFormDialog open={dialogOpen} spell={editing} onClose={() => setDialogOpen(false)} />
    </Box>
  )
}
