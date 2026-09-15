import type { CharacterProfile } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useUpdateProfile } from '@/hooks/mutations/useProfileMutations'
import { errorMessage } from '@/lib/errorMessages'

/** Saves on blur or Enter: a one-liner with its own Save button is a form nobody asked for. */
export default function ProfileDescription({ profile }: { profile: CharacterProfile }) {
  const { character } = useActiveCharacter()
  const update = useUpdateProfile(character.id)
  // Null while not editing, so an edit made elsewhere (the panel, the tab) shows up here.
  const [draft, setDraft] = useState<string | null>(null)

  function save() {
    if (draft === null) return
    const description = draft.trim()
    if (description === profile.description) return setDraft(null)
    update.mutate({ ref: profile.ref, input: { description } }, { onSuccess: () => setDraft(null) })
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <TextField
        size="small"
        multiline
        label="Description"
        placeholder="who they are..."
        value={draft ?? profile.description}
        onFocus={() => setDraft((current) => current ?? profile.description)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || event.shiftKey) return
          event.preventDefault()
          ;(event.target as HTMLElement).blur()
        }}
        slotProps={{ htmlInput: { maxLength: 500 }, inputLabel: { shrink: true } }}
      />
      {update.error ? (
        <Typography variant="body2" role="alert">
          {errorMessage(update.error)}
        </Typography>
      ) : null}
    </Box>
  )
}
