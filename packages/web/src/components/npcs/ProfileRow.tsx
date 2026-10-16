import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import type { CharacterProfile } from '@player-ledger/shared'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import RuledRow from '@/components/ledger/RuledRow'
import ProfileImage from '@/sharedComponents/ProfileImage'

export type ProfileRowProps = {
  profile: CharacterProfile
  meta: string
  onOpen: () => void
  onRemove?: () => void
  disabled?: boolean
}

export default function ProfileRow({ profile, meta, onOpen, onRemove, disabled }: ProfileRowProps) {
  const { character } = useActiveCharacter()
  return (
    <RuledRow columns="minmax(0, 1fr) 36px">
      <ButtonBase
        onClick={onOpen}
        sx={{
          display: 'grid',
          gridTemplateColumns: '28px minmax(0, 1fr)',
          alignItems: 'center',
          columnGap: 4,
          py: 2,
          textAlign: 'left',
          justifyContent: 'stretch',
        }}
      >
        <ProfileImage characterId={character.id} profile={profile} size={28} />
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 3, minWidth: 0 }}>
          <Typography variant="body1" component="span" sx={{ flex: 'none' }}>
            {profile.name}
          </Typography>
          <Typography
            variant="capsXs"
            component="span"
            sx={{ color: 'ledger.muted', flex: 'none' }}
          >
            {meta}
          </Typography>
          {profile.description ? (
            <Typography variant="bodySm" component="span" noWrap sx={{ color: 'ledger.muted' }}>
              {profile.description}
            </Typography>
          ) : null}
        </Box>
      </ButtonBase>
      <Box data-row-actions>
        {onRemove ? (
          <IconButton aria-label={`Delete ${profile.name}`} onClick={onRemove} disabled={disabled}>
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>
    </RuledRow>
  )
}
