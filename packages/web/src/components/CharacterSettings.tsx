import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useRenameCharacter } from '@/hooks/mutations/useCreateIdentity'
import { useUpdateProfile } from '@/hooks/mutations/useProfileMutations'
import { useCurrentIdentity } from '@/hooks/queries/useIdentity'
import { useProfiles } from '@/hooks/queries/useProfiles'
import { errorMessage } from '@/lib/errorMessages'

/** The sidebar's name and title. The title is the character's own profile description. */
export default function CharacterSettings({
  userId,
  characterId,
}: {
  userId: string
  characterId: string
}) {
  const { character } = useCurrentIdentity()
  const profiles = useProfiles(characterId)
  const own = profiles.data?.find((profile) => profile.ref === `pc:${characterId}`)
  const rename = useRenameCharacter(userId, characterId)
  const updateProfile = useUpdateProfile(characterId)

  const [name, setName] = useState(character?.name ?? '')
  const [title, setTitle] = useState(own?.description ?? '')
  useEffect(() => setName(character?.name ?? ''), [character?.name])
  useEffect(() => setTitle(own?.description ?? ''), [own?.description])

  function saveName() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== character?.name) rename.mutate(trimmed)
    else setName(character?.name ?? '')
  }

  function saveTitle() {
    if (!own || title.trim() === own.description) return
    updateProfile.mutate({ ref: own.ref, input: { description: title.trim() } })
  }

  const error = rename.error ?? updateProfile.error

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <TextField
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={saveName}
        onKeyDown={(event) => event.key === 'Enter' && saveName()}
        slotProps={{ htmlInput: { maxLength: 80 } }}
      />
      <TextField
        label="Title"
        placeholder="Warden of the grove"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onBlur={saveTitle}
        onKeyDown={(event) => event.key === 'Enter' && saveTitle()}
        slotProps={{ htmlInput: { maxLength: 120 } }}
      />
      <Typography variant="caption">
        Saved when you leave the field. The portrait is changed by hovering it in the sidebar.
      </Typography>
      {error ? (
        <Typography variant="caption" role="alert" sx={{ color: 'error.main' }}>
          {rename.error ? 'That name is taken, or could not be saved.' : errorMessage(error)}
        </Typography>
      ) : null}
    </Box>
  )
}
