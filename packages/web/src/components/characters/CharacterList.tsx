import type { CharacterProfile } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { type ReactNode, useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useProfiles } from '@/hooks/queries/useProfiles'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import SectionLabel from '@/sharedComponents/SectionLabel'
import AddNpcForm from './AddNpcForm'
import CharacterRow from './CharacterRow'

export default function CharacterList() {
  const { character } = useActiveCharacter()
  const profiles = useProfiles(character.id)
  const [expandedRef, setExpandedRef] = useState<string | null>(null)

  if (profiles.isPending) return <Loading size={20} label="Loading characters" />
  if (profiles.isError) {
    return (
      <LoadFailure
        error={profiles.error}
        fallback="Could not load characters."
        onRetry={() => void profiles.refetch()}
      />
    )
  }

  const party = profiles.data.filter((profile) => profile.kind === 'pc')
  const npcs = profiles.data.filter((profile) => profile.kind === 'npc')

  const rows = (list: CharacterProfile[], empty: string) => (
    <Rows
      profiles={list}
      empty={empty}
      expandedRef={expandedRef}
      onToggle={(ref) => setExpandedRef((current) => (current === ref ? null : ref))}
      onExpand={setExpandedRef}
    />
  )

  return (
    <>
      <Group label="Party">{rows(party, 'No one in the party yet.')}</Group>
      <Group label="NPCs">
        {rows(npcs, 'No NPCs yet.')}
        <AddNpcForm onCreated={setExpandedRef} />
      </Group>
    </>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ display: 'grid', gap: '10px' }}>
      <SectionLabel>{label}</SectionLabel>
      <Paper variant="section">{children}</Paper>
    </Box>
  )
}

type RowsProps = {
  profiles: CharacterProfile[]
  empty: string
  expandedRef: string | null
  onToggle: (ref: string) => void
  onExpand: (ref: string | null) => void
}

function Rows({ profiles, empty, expandedRef, onToggle, onExpand }: RowsProps) {
  if (profiles.length === 0) {
    return (
      <Typography variant="body2" data-empty="true">
        {empty}
      </Typography>
    )
  }
  return (
    <Box>
      {profiles.map((profile) => (
        <CharacterRow
          key={profile.ref}
          profile={profile}
          expanded={expandedRef === profile.ref}
          onToggle={() => onToggle(profile.ref)}
          onOpenProfile={onExpand}
          onDeleted={() => onExpand(null)}
        />
      ))}
    </Box>
  )
}
