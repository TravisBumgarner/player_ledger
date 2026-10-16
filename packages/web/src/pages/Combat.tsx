import type { Spell } from '@awesomeness-mgmt/shared'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import EmptyState from '@/components/ledger/EmptyState'
import { AnimatePresence, MotionRow } from '@/components/ledger/motion'
import Page from '@/components/ledger/Page'
import Section from '@/components/ledger/Section'
import ModifiersCard from '@/components/overview/ModifiersCard'
import SpellCard from '@/components/spells/SpellCard'
import SpellFormDialog from '@/components/spells/SpellFormDialog'
import { useSpells } from '@/hooks/queries/useSpells'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'

export default function Combat() {
  const { character } = useActiveCharacter()
  const spells = useSpells(character.id)
  const [dialogOpen, setDialogOpen] = useState(false)
  // Kept after closing, so the dialog does not retitle itself while it fades out.
  const [editing, setEditing] = useState<Spell | null>(null)

  function openDialog(spell: Spell | null) {
    setEditing(spell)
    setDialogOpen(true)
  }

  function renderSpells() {
    if (spells.isPending) return <Loading size={20} label="Loading spells" />
    if (spells.isError) {
      return (
        <LoadFailure
          dense
          error={spells.error}
          fallback="Could not load spells."
          onRetry={() => void spells.refetch()}
        />
      )
    }
    if (spells.data.length === 0) return <EmptyState>No spells yet.</EmptyState>
    return (
      <AnimatePresence initial={false}>
        {spells.data.map((spell) => (
          <MotionRow key={spell.id}>
            <SpellCard key={spell.id} spell={spell} onEdit={() => openDialog(spell)} />
          </MotionRow>
        ))}
      </AnimatePresence>
    )
  }

  return (
    <Page>
      <ModifiersCard />
      <Section
        title="Custom spells"
        right={
          <Button variant="text" onClick={() => openDialog(null)}>
            + Add spell
          </Button>
        }
      >
        {renderSpells()}
      </Section>
      <SpellFormDialog open={dialogOpen} spell={editing} onClose={() => setDialogOpen(false)} />
    </Page>
  )
}
