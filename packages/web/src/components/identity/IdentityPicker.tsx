import { createUserSchema } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, type ReactNode, useState } from 'react'
import { errorMessage } from '@/lib/errorMessages'
import SectionLabel from '@/sharedComponents/SectionLabel'

type Named = { id: string; name: string }

export type IdentityPickerProps = {
  heading: string
  fieldLabel: string
  existingLabel: string
  existing: Named[]
  selectedId: string | null
  onPick: (id: string) => void
  /** Resolves to the row the name landed on, which may be one that already existed. */
  onCreate: (name: string) => Promise<Named>
  isCreating: boolean
  createError: unknown
  footer?: ReactNode
}

/** One step of "who are you": type a name, or pick one somebody already typed. */
export default function IdentityPicker({
  heading,
  fieldLabel,
  existingLabel,
  existing,
  selectedId,
  onPick,
  onCreate,
  isCreating,
  createError,
  footer,
}: IdentityPickerProps) {
  const [name, setName] = useState('')

  // Users and characters share the same name rule.
  const parsed = createUserSchema.safeParse({ name })
  const tooLong = name.trim().length > 0 && !parsed.success

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) return
    void onCreate(parsed.data.name).then((row) => onPick(row.id))
  }

  const helperText = tooLong
    ? 'Keep it under 80 characters.'
    : createError
      ? errorMessage(createError)
      : ' '

  return (
    <Box sx={{ display: 'grid', gap: 2, maxWidth: 480, width: '100%', mx: 'auto' }}>
      <Typography variant="h1">{heading}</Typography>

      <Paper variant="section" component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            label={fieldLabel}
            size="small"
            fullWidth
            required
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={tooLong || Boolean(createError)}
            helperText={helperText}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!parsed.success || isCreating}
            sx={{ flex: 'none', mt: '2px' }}
          >
            {isCreating ? 'Saving…' : 'Continue'}
          </Button>
        </Box>
      </Paper>

      {existing.length > 0 ? (
        <Paper variant="panel">
          <SectionLabel>{existingLabel}</SectionLabel>
          <List disablePadding>
            {existing.map((row) => (
              <ListItemButton
                key={row.id}
                selected={row.id === selectedId}
                onClick={() => onPick(row.id)}
              >
                <ListItemText primary={row.name} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      ) : null}

      {footer}
    </Box>
  )
}
