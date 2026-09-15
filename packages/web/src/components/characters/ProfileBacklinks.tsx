import type { Backlink } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useBacklinks } from '@/hooks/queries/useProfiles'
import { ROUTES } from '@/lib/routes'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'

const SOURCE_LABELS: Record<Backlink['source'], string> = {
  sessionNote: 'Session note',
  brewingNote: 'Brewing note',
  profile: 'Character notes',
  development: 'Overview',
}

const SOURCE_ROUTES: Record<Exclude<Backlink['source'], 'profile'>, string> = {
  sessionNote: ROUTES.sessionNotes,
  brewingNote: ROUTES.brewing,
  development: ROUTES.overview,
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
    <Box component="section" aria-label="Mentioned in" sx={{ display: 'grid', gap: 0.5 }}>
      <Typography variant="overline" component="h3">
        Mentioned in
      </Typography>

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
        <Typography variant="body2" data-empty="true">
          Not mentioned anywhere yet.
        </Typography>
      ) : (
        <List disablePadding>
          {backlinks.data.map((link) => (
            <ListItemButton
              key={`${link.source}:${link.id}`}
              onClick={() => {
                if (link.source === 'profile') onOpenProfile(link.id)
                else navigate(SOURCE_ROUTES[link.source])
              }}
              sx={{ px: 1, mx: -1 }}
            >
              <ListItemText primary={link.title} secondary={SOURCE_LABELS[link.source]} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  )
}
