import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { type FormEvent, useState } from 'react'
import { errorMessage } from '@/lib/errorMessages'
import TextAction from '@/sharedComponents/TextAction'

export type NoteFormProps = {
  placeholder: string
  submitLabel: string
  /** A use can be logged without a word of explanation; a note cannot be empty. */
  optional?: boolean
  isPending: boolean
  error: unknown
  onSubmit: (text: string) => Promise<unknown>
  onCancel: () => void
}

/** The inline input under a row or card, for "Log use" and "+ note". */
export default function NoteForm({
  placeholder,
  submitLabel,
  optional = false,
  isPending,
  error,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [text, setText] = useState('')
  const canSubmit = !isPending && (optional || text.trim().length > 0)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(text.trim()).then(onCancel, () => undefined)
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '8px' }}
    >
      <TextField
        size="small"
        autoFocus
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        error={Boolean(error)}
        helperText={error ? errorMessage(error) : undefined}
        slotProps={{ htmlInput: { maxLength: 1000, 'aria-label': placeholder } }}
        sx={{ flex: '1 1 160px' }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: 36 }}>
        <Button type="submit" size="small" disabled={!canSubmit}>
          {submitLabel}
        </Button>
        <TextAction onClick={onCancel}>Cancel</TextAction>
      </Box>
    </Box>
  )
}
