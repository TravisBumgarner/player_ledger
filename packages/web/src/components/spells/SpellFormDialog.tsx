import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { type CreateSpell, createSpellSchema, type Spell } from '@player-ledger/shared'
import { type FormEvent, useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useCreateSpell, useDeleteSpell, useUpdateSpell } from '@/hooks/mutations/useSpellMutations'
import { errorMessage } from '@/lib/errorMessages'

/** Number fields stay strings while typed, so clearing one to retype it is allowed. */
type Draft = Omit<CreateSpell, 'level' | 'slotsTotal'> & { level: string; slotsTotal: string }

function draftFor(spell: Spell | null): Draft {
  if (!spell) {
    return {
      name: '',
      level: '1',
      school: '',
      description: '',
      slotsTotal: '1',
      resetOn: 'long',
      prepared: true,
    }
  }
  return {
    name: spell.name,
    level: String(spell.level),
    school: spell.school,
    description: spell.description,
    slotsTotal: String(spell.slotsTotal),
    resetOn: spell.resetOn,
    prepared: spell.prepared,
  }
}

const toNumber = (value: string) => (value.trim() === '' ? Number.NaN : Number(value))

export type SpellFormDialogProps = {
  open: boolean
  /** Null adds a new spell. */
  spell: Spell | null
  onClose: () => void
}

export default function SpellFormDialog({ open, spell, onClose }: SpellFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {/* The dialog unmounts its body once closed, so each opening starts a fresh draft. */}
      <SpellForm key={spell?.id ?? 'new'} spell={spell} onClose={onClose} />
    </Dialog>
  )
}

function SpellForm({ spell, onClose }: { spell: Spell | null; onClose: () => void }) {
  const { character } = useActiveCharacter()
  const create = useCreateSpell(character.id)
  const update = useUpdateSpell(character.id)
  const remove = useDeleteSpell(character.id)
  const [draft, setDraft] = useState(() => draftFor(spell))

  const patch = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }))

  const parsed = createSpellSchema.safeParse({
    ...draft,
    level: toNumber(draft.level),
    slotsTotal: toNumber(draft.slotsTotal),
  })
  const issues = new Set(parsed.success ? [] : parsed.error.issues.map((issue) => issue.path[0]))
  const busy = create.isPending || update.isPending || remove.isPending
  const failure = create.error ?? update.error ?? remove.error

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) return
    const done = { onSuccess: onClose }
    if (spell) update.mutate({ spellId: spell.id, input: parsed.data }, done)
    else create.mutate(parsed.data, done)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogTitle>{spell ? 'Edit Spell' : 'Add Spell'}</DialogTitle>

      <DialogContent sx={{ display: 'grid', gap: '14px' }}>
        <TextField
          label="Name"
          size="small"
          required
          autoFocus
          value={draft.name}
          onChange={(event) => patch({ name: event.target.value })}
          error={draft.name.trim() !== '' && issues.has('name')}
          helperText={
            draft.name.trim() !== '' && issues.has('name')
              ? 'Keep it under 120 characters.'
              : undefined
          }
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
          <TextField
            label="Level"
            size="small"
            type="number"
            slotProps={{ htmlInput: { min: 0, max: 9 } }}
            value={draft.level}
            onChange={(event) => patch({ level: event.target.value })}
            error={issues.has('level')}
            helperText={issues.has('level') ? '0 to 9' : undefined}
          />
          <TextField
            label="School"
            size="small"
            value={draft.school}
            onChange={(event) => patch({ school: event.target.value })}
            error={issues.has('school')}
          />
        </Box>

        <TextField
          label="Description"
          size="small"
          multiline
          minRows={3}
          value={draft.description}
          onChange={(event) => patch({ description: event.target.value })}
          error={issues.has('description')}
        />

        <TextField
          label="Slots per rest"
          size="small"
          type="number"
          slotProps={{ htmlInput: { min: 0 } }}
          value={draft.slotsTotal}
          onChange={(event) => patch({ slotsTotal: event.target.value })}
          error={issues.has('slotsTotal')}
          helperText={issues.has('slotsTotal') ? 'A whole number, 0 or more' : undefined}
        />

        <Box sx={{ display: 'grid', gap: '6px' }}>
          <Typography variant="overline" component="p" id="spell-reset-on">
            Resets on
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            aria-labelledby="spell-reset-on"
            value={draft.resetOn}
            onChange={(_event, value: Draft['resetOn'] | null) => {
              if (value) patch({ resetOn: value })
            }}
          >
            <ToggleButton value="short">Short Rest</ToggleButton>
            <ToggleButton value="long">Long Rest</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <FormControlLabel
          label="Currently prepared"
          control={
            <Checkbox
              size="small"
              checked={draft.prepared}
              onChange={(event) => patch({ prepared: event.target.checked })}
            />
          }
        />

        {failure ? <Alert severity="error">{errorMessage(failure)}</Alert> : null}
      </DialogContent>

      <DialogActions>
        {spell ? (
          <Button
            variant="text"
            color="error"
            size="small"
            disabled={busy}
            onClick={() => remove.mutate(spell.id, { onSuccess: onClose })}
            sx={{ mr: 'auto' }}
          >
            Delete
          </Button>
        ) : null}
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={!parsed.success || busy}>
          Save
        </Button>
      </DialogActions>
    </Box>
  )
}
