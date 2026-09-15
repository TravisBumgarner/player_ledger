import type { CharacterProfile } from '@awesomeness-mgmt/shared'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useEffect, useRef } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import ProfileImage from '@/sharedComponents/ProfileImage'
import DeleteNpcAction from './DeleteNpcAction'
import ProfileBacklinks from './ProfileBacklinks'
import ProfileDescription from './ProfileDescription'
import ProfileNotes from './ProfileNotes'
import ProfilePortraitEditor from './ProfilePortraitEditor'

export function profileMeta(profile: CharacterProfile): string {
  if (profile.kind === 'npc') return 'NPC'
  return profile.isSelf ? 'you' : `played by ${profile.playedBy}`
}

export type CharacterRowProps = {
  profile: CharacterProfile
  expanded: boolean
  onToggle: () => void
  onOpenProfile: (ref: string) => void
  onDeleted: () => void
}

export default function CharacterRow({
  profile,
  expanded,
  onToggle,
  onOpenProfile,
  onDeleted,
}: CharacterRowProps) {
  const { character } = useActiveCharacter()
  const rowRef = useRef<HTMLDivElement>(null)
  const bodyId = `character-${profile.ref.replace(':', '-')}`

  // A row expanded from a backlink or the Add NPC form may be off screen.
  useEffect(() => {
    if (expanded) rowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [expanded])

  return (
    <Paper ref={rowRef} variant="row" data-active={expanded}>
      <ButtonBase
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 1.5,
          textAlign: 'left',
          py: 0.75,
          px: 1,
        }}
      >
        <ProfileImage characterId={character.id} profile={profile} size={32} />
        <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" component="span">
              {profile.name}
            </Typography>
            <Typography variant="caption" component="span">
              {profileMeta(profile)}
            </Typography>
          </Box>
          {profile.description && !expanded ? (
            <Typography variant="body2" component="span" color="text.secondary">
              {profile.description}
            </Typography>
          ) : null}
        </Box>
        <ExpandMoreIcon
          fontSize="small"
          color="action"
          sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
        />
      </ButtonBase>

      {expanded ? (
        <Box
          id={bodyId}
          role="region"
          aria-label={profile.name}
          sx={{ display: 'grid', gap: 2, px: 1, pt: 1, pb: 2.5 }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
              alignItems: 'start',
              gap: 2,
            }}
          >
            <ProfilePortraitEditor profile={profile} size={128} />
            <ProfileDescription profile={profile} />
          </Box>
          <Divider />
          <ProfileNotes profile={profile} />
          <Divider />
          <ProfileBacklinks profileRef={profile.ref} onOpenProfile={onOpenProfile} />
          {profile.kind === 'npc' ? (
            <>
              <Divider />
              <DeleteNpcAction profile={profile} onDeleted={onDeleted} />
            </>
          ) : null}
        </Box>
      ) : null}
    </Paper>
  )
}
