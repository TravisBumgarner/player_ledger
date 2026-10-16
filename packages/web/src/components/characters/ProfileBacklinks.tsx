import type { Backlink } from '@awesomeness-mgmt/shared'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import Badge from '@/components/ledger/Badge'
import EmptyState from '@/components/ledger/EmptyState'
import RuledRow from '@/components/ledger/RuledRow'
import SectionHeader from '@/components/ledger/SectionHeader'
import { useBacklinks } from '@/hooks/queries/useProfiles'
import { ROUTES } from '@/lib/routes'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'

const SOURCE_LABELS: Record<Backlink['source'], string> = {
  sessionNote: 'Session note',
  brewingNote: 'Brewing note',
  graftingNote: 'Grafting note',
  profile: 'Character notes',
  development: 'Character development',
}

const SOURCE_ROUTES: Record<Exclude<Backlink['source'], 'profile'>, string> = {
  sessionNote: ROUTES.sessionNotes,
  brewingNote: ROUTES.brewing,
  graftingNote: ROUTES.grafting,
  development: ROUTES.development,
}

export type ProfileBacklinksProps = {
  profileRef: string
  /** Where a mention from another character's notes leads: the tab expands them, the panel swaps. */
  onOpenProfile: (ref: string) => void
}

export default function ProfileBacklinks({ profileRef, onOpenProfile }: ProfileBacklinksProps) {
  const { character } = useActiveCharacter()
  const backlinks = useBacklinks(character.id, profileRef)
  const navigate = useNavigate()

  return (
    <Box component="section" aria-label="Mentioned in">
      <SectionHeader
        title="Mentioned in"
        right={backlinks.data?.length ? <Badge>{backlinks.data.length}</Badge> : null}
      />

      {backlinks.isPending ? (
        <Loading size={20} label="Loading mentions" />
      ) : backlinks.isError ? (
        <LoadFailure
          dense
          error={backlinks.error}
          fallback="Could not load mentions."
          onRetry={() => void backlinks.refetch()}
        />
      ) : backlinks.data.length === 0 ? (
        <EmptyState>Not mentioned anywhere yet.</EmptyState>
      ) : (
        backlinks.data.map((link) => (
          <RuledRow key={`${link.source}:${link.id}`} columns="minmax(0, 1fr)">
            <ButtonBase
              onClick={() => {
                if (link.source === 'profile') onOpenProfile(link.id)
                else navigate(SOURCE_ROUTES[link.source])
              }}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                alignItems: 'center',
                columnGap: 2,
                py: 2,
                textAlign: 'left',
              }}
            >
              <Box sx={{ display: 'grid', gap: 0.5, minWidth: 0 }}>
                <Typography variant="bodySm" noWrap>
                  {link.title}
                </Typography>
                <Typography variant="capsXs">{SOURCE_LABELS[link.source]}</Typography>
              </Box>
              <ChevronRightIcon fontSize="small" color="action" />
            </ButtonBase>
          </RuledRow>
        ))
      )}
    </Box>
  )
}
