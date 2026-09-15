import {
  type CharacterProfile,
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_TYPES,
} from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { type ChangeEvent, useRef, useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useDeleteProfileImage, useUploadProfileImage } from '@/hooks/mutations/useProfileMutations'
import { errorMessage } from '@/lib/errorMessages'
import ProfileImage from '@/sharedComponents/ProfileImage'
import TextAction from '@/sharedComponents/TextAction'
import { resizeImage } from './resizeImage'

export type ProfilePortraitEditorProps = {
  profile: CharacterProfile
  size: number
}

export default function ProfilePortraitEditor({ profile, size }: ProfilePortraitEditorProps) {
  const { character } = useActiveCharacter()
  const upload = useUploadProfileImage(character.id)
  const remove = useDeleteProfileImage(character.id)
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const hasImage = profile.imageVersion !== null
  const busy = upload.isPending || remove.isPending
  const error =
    localError ??
    (upload.error ? errorMessage(upload.error) : remove.error ? errorMessage(remove.error) : null)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Cleared, so picking the same file again still fires a change.
    event.target.value = ''
    if (!file) return

    upload.reset()
    remove.reset()
    setLocalError(null)

    let image: Blob
    try {
      image = await resizeImage(file)
    } catch {
      setLocalError('That image could not be read. Try a PNG, JPEG, WebP or GIF.')
      return
    }
    if (image.size > PROFILE_IMAGE_MAX_BYTES) {
      setLocalError('That image is too large even after resizing. Try a smaller one.')
      return
    }
    upload.mutate({ ref: profile.ref, image })
  }

  function handleRemove() {
    upload.reset()
    setLocalError(null)
    remove.mutate(profile.ref)
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.75, justifyItems: 'start', alignContent: 'start' }}>
      <ProfileImage characterId={character.id} profile={profile} size={size} />

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
        <TextAction disabled={busy} onClick={() => inputRef.current?.click()}>
          {hasImage ? 'Replace' : 'Upload image'}
        </TextAction>
        {hasImage ? (
          <TextAction disabled={busy} onClick={handleRemove}>
            Remove
          </TextAction>
        ) : null}
        {busy ? (
          <Typography variant="caption" role="status">
            {upload.isPending ? 'Uploading...' : 'Removing...'}
          </Typography>
        ) : null}
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept={PROFILE_IMAGE_TYPES.join(',')}
        hidden
        aria-label={`Portrait for ${profile.name}`}
        onChange={(event) => void handleFile(event)}
      />

      {error ? (
        <Typography variant="body2" role="alert" sx={{ maxWidth: Math.max(size, 220) }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  )
}
