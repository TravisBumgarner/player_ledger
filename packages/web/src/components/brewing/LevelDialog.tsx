import { type BrewingState, updateBrewingLevelSchema } from '@awesomeness-mgmt/shared'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { type FormEvent, useState } from 'react'
import { parseWhole } from '@/components/brewing/progress'
import { useUpdateBrewingLevel } from '@/hooks/mutations/useBrewingMutations'
import { errorMessage } from '@/lib/errorMessages'

const FIELDS = [
  { key: 'level', label: 'Level' },
  { key: 'exp', label: 'Current exp' },
  { key: 'expAtLevel', label: 'Exp at this level' },
  { key: 'expToNext', label: 'Exp for next level' },
] as const

type FieldKey = (typeof FIELDS)[number]['key']

export type LevelDialogProps = {
  characterId: string
  state: BrewingState
  onClose: () => void
}

/** Levelling is by hand: logging exp never moves the level, so the thresholds live here. */
export default function LevelDialog({ characterId, state, onClose }: LevelDialogProps) {
  const [draft, setDraft] = useState<Record<FieldKey, string>>({
    level: String(state.level),
    exp: String(state.exp),
    expAtLevel: String(state.expAtLevel),
    expToNext: String(state.expToNext),
  })
  const update = useUpdateBrewingLevel(characterId)

  const parsed = updateBrewingLevelSchema.required().safeParse({
    level: parseWhole(draft.level),
    exp: parseWhole(draft.exp),
    expAtLevel: parseWhole(draft.expAtLevel),
    expToNext: parseWhole(draft.expToNext),
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) return
    update.mutate(parsed.data, { onSuccess: onClose })
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Potion making level</DialogTitle>
        <DialogContent sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {FIELDS.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              size="small"
              type="number"
              value={draft[field.key]}
              onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
              slotProps={{ htmlInput: { min: 0 }, inputLabel: { shrink: true } }}
            />
          ))}
          {update.isError ? (
            <Alert severity="error" sx={{ gridColumn: '1 / -1' }}>
              {errorMessage(update.error)}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!parsed.success || update.isPending}>
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
