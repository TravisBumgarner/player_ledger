import {
  type CharacterProfile,
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_TYPES,
} from '@awesomeness-mgmt/shared'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import { alpha, styled } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { type ChangeEvent, useRef, useState } from 'react'
import type { Area } from 'react-easy-crop'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useDeleteProfileImage, useUploadProfileImage } from '@/hooks/mutations/useProfileMutations'
import { errorMessage } from '@/lib/errorMessages'
import { profileImageUrl } from '@/sharedComponents/ProfileImage'
import { RADIUS } from '@/theme/tokens'
import PortraitCropDialog from './PortraitCropDialog'
import { cropImage } from './resizeImage'

const FRAME_PAD = 5

const Frame = styled('div')(({ theme }) => {
  const { ground, panel, line2, muted } = theme.palette.ledger
  const inner = `${RADIUS.portraitTop - FRAME_PAD}px ${RADIUS.portraitTop - FRAME_PAD}px ${RADIUS.badge}px ${RADIUS.badge}px`
  return {
    position: 'relative',
    padding: FRAME_PAD,
    boxSizing: 'border-box',
    border: `1px solid ${line2}`,
    borderRadius: `${RADIUS.portraitTop}px ${RADIUS.portraitTop}px ${RADIUS.portraitBottom}px ${RADIUS.portraitBottom}px`,
    '& [data-portrait-image]': {
      display: 'block',
      width: '100%',
      aspectRatio: '1',
      objectFit: 'cover',
      borderRadius: inner,
    },
    '& [data-portrait-empty]': {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      backgroundColor: panel,
      color: muted,
      '&:hover': { color: theme.palette.ledger.text },
    },
    '& [data-portrait-actions]': {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: FRAME_PAD + 8,
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      opacity: 0,
      transition: 'opacity 120ms ease-out',
    },
    '& [data-portrait-actions] .MuiIconButton-root': {
      backgroundColor: alpha(ground, 0.85),
      border: `1px solid ${line2}`,
      '&:hover': { backgroundColor: ground },
    },
    '&:hover [data-portrait-actions], &:focus-within [data-portrait-actions], &[data-busy="true"] [data-portrait-actions]':
      { opacity: 1 },
    '@media (hover: none)': { '& [data-portrait-actions]': { opacity: 1 } },
  }
})

export type ProfilePortraitEditorProps = {
  profile: CharacterProfile
  size: number
}

export default function ProfilePortraitEditor({ profile, size }: ProfilePortraitEditorProps) {
  const { character } = useActiveCharacter()
  const upload = useUploadProfileImage(character.id)
  const remove = useDeleteProfileImage(character.id)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [cropError, setCropError] = useState<string | null>(null)
  const [pickError, setPickError] = useState<string | null>(null)
  const [encoding, setEncoding] = useState(false)

  const url = profileImageUrl(character.id, profile)
  const busy = upload.isPending || remove.isPending || encoding
  const error = pickError ?? (remove.error ? errorMessage(remove.error) : null)

  function pickFile() {
    upload.reset()
    remove.reset()
    setPickError(null)
    inputRef.current?.click()
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Cleared, so picking the same file again still fires a change.
    event.target.value = ''
    if (!file) return

    try {
      ;(await createImageBitmap(file)).close()
    } catch {
      setPickError('That image could not be read. Try a PNG, JPEG, WebP or GIF.')
      return
    }
    setCropError(null)
    setPendingFile(file)
  }

  async function handleSave(area: Area) {
    if (!pendingFile) return
    setCropError(null)
    setEncoding(true)
    let image: Blob
    try {
      image = await cropImage(pendingFile, area)
    } catch {
      setCropError('That image could not be cropped. Try another one.')
      return
    } finally {
      setEncoding(false)
    }
    if (image.size > PROFILE_IMAGE_MAX_BYTES) {
      setCropError('That image is too large even after resizing. Try a smaller one.')
      return
    }
    upload.mutate(
      { ref: profile.ref, image },
      {
        onSuccess: () => setPendingFile(null),
        onError: (uploadError) => setCropError(errorMessage(uploadError)),
      },
    )
  }

  function handleRemove() {
    upload.reset()
    setPickError(null)
    remove.mutate(profile.ref)
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, justifyItems: 'center' }}>
      <Frame data-portrait-frame data-busy={busy} style={{ width: size }}>
        {url ? (
          <>
            <img data-portrait-image src={url} alt={`Portrait of ${profile.name}`} />
            <div data-portrait-actions>
              <Tooltip title="Replace image">
                <IconButton aria-label="Replace image" disabled={busy} onClick={pickFile}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove image">
                <IconButton aria-label="Remove image" disabled={busy} onClick={handleRemove}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </>
        ) : (
          <ButtonBase
            data-portrait-image
            data-portrait-empty
            disabled={busy}
            onClick={pickFile}
            aria-label={`Add image for ${profile.name}`}
          >
            <AddPhotoAlternateOutlinedIcon />
            <Typography variant="capsXs" color="inherit">
              Add image
            </Typography>
          </ButtonBase>
        )}
      </Frame>

      {remove.isPending ? (
        <Typography variant="caption" role="status">
          Removing...
        </Typography>
      ) : null}
      {error ? (
        <Typography
          variant="body2"
          color="error"
          role="alert"
          sx={{ maxWidth: Math.max(size, 220) }}
        >
          {error}
        </Typography>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={PROFILE_IMAGE_TYPES.join(',')}
        hidden
        aria-label={`Portrait for ${profile.name}`}
        onChange={(event) => void handleFile(event)}
      />

      <PortraitCropDialog
        file={pendingFile}
        name={profile.name}
        saving={busy}
        error={cropError}
        onCancel={() => setPendingFile(null)}
        onSave={(area) => void handleSave(area)}
      />
    </Box>
  )
}
