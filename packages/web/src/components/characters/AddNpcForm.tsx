import { createNpcSchema } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useCreateNpc } from '@/hooks/mutations/useProfileMutations'
import { errorMessage } from '@/lib/errorMessages'

export default function AddNpcForm({ onCreated }: { onCreated: (ref: string) => void }) {
  const { character } = useActiveCharacter()
  const createNpc = useCreateNpc(character.id)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const parsed = createNpcSchema.safeParse({ name, description })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) return
    createNpc.mutate(parsed.data, {
      onSuccess: (profile) => {
        setName('')
        setDescription('')
        onCreated(profile.ref)
      },
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="name..."
          value={name}
          onChange={(event) => setName(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 120, 'aria-label': 'NPC name' } }}
          sx={{ flex: 1, minWidth: 140 }}
        />
        <TextField
          size="small"
          placeholder="who they are..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 500, 'aria-label': 'NPC description' } }}
          sx={{ flex: 2, minWidth: 180 }}
        />
        <Button type="submit" variant="contained" disabled={!parsed.success || createNpc.isPending}>
          Add NPC
        </Button>
      </Box>
      {createNpc.error ? (
        <Typography variant="body2" role="alert">
          {errorMessage(createNpc.error)}
        </Typography>
      ) : null}
    </Box>
  )
}
