import { type CharacterProfile, profileImagePath } from '@awesomeness-mgmt/shared'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import config from '@/config'

export function profileImageUrl(characterId: string, profile: CharacterProfile): string | null {
  const path = profileImagePath(characterId, profile)
  return path ? `${config.apiBaseUrl}${path}` : null
}

export type ProfileImageProps = {
  /** The active character, whose ledger the portrait belongs to. */
  characterId: string
  profile: CharacterProfile
  /** Edge in px. Small sizes are a round avatar; larger ones a square portrait. */
  size: number
}

const AVATAR_MAX = 48

/** A character's portrait, or their initial (small) / a striped placeholder (large) when there is none. */
export default function ProfileImage({ characterId, profile, size }: ProfileImageProps) {
  const url = profileImageUrl(characterId, profile)

  if (size <= AVATAR_MAX) {
    return (
      <Avatar
        src={url ?? undefined}
        alt={profile.name}
        sx={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        {profile.name.charAt(0).toUpperCase()}
      </Avatar>
    )
  }

  if (!url) {
    return (
      <Paper
        variant="placeholder"
        role="img"
        aria-label={`No portrait for ${profile.name}`}
        sx={{ width: size, height: size, flex: 'none' }}
      />
    )
  }

  return (
    <Box
      component="img"
      src={url}
      alt={profile.name}
      sx={{ width: size, height: size, objectFit: 'cover', display: 'block', flex: 'none' }}
    />
  )
}
