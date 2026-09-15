import { type BrewingState, logExpSchema } from '@awesomeness-mgmt/shared'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import CardHeader from '@/components/brewing/CardHeader'
import LevelDialog from '@/components/brewing/LevelDialog'
import { parseWhole, percentOf } from '@/components/brewing/progress'
import { useLogExp } from '@/hooks/mutations/useBrewingMutations'
import { errorMessage } from '@/lib/errorMessages'
import TextAction from '@/sharedComponents/TextAction'

export type LevelCardProps = { characterId: string; state: BrewingState }

export default function LevelCard({ characterId, state }: LevelCardProps) {
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(false)
  const addExp = useLogExp(characterId)

  const parsed = logExpSchema.safeParse({ amount: parseWhole(draft) })
  const progress = percentOf(state.exp - state.expAtLevel, state.expToNext - state.expAtLevel)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) return
    addExp.mutate(parsed.data.amount, { onSuccess: () => setDraft('') })
  }

  return (
    <Paper variant="section" component="section" aria-label="Potion making level">
      <CardHeader title={`Potion Making — Level ${state.level}`}>
        <Typography variant="body1" component="p">
          {state.exp} / {state.expToNext} exp
        </Typography>
        <TextAction onClick={() => setEditing(true)}>Edit</TextAction>
      </CardHeader>

      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label={`${Math.round(progress)}% of the way to the next level`}
      />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
      >
        <TextField
          size="small"
          type="number"
          placeholder="exp"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          slotProps={{ htmlInput: { min: 1, 'aria-label': 'Exp to log' } }}
          sx={{ width: 110 }}
        />
        <Button type="submit" size="small" disabled={!parsed.success || addExp.isPending}>
          Log Exp
        </Button>
      </Box>

      {addExp.isError ? <Alert severity="error">{errorMessage(addExp.error)}</Alert> : null}

      {editing ? (
        <LevelDialog characterId={characterId} state={state} onClose={() => setEditing(false)} />
      ) : null}
    </Paper>
  )
}
