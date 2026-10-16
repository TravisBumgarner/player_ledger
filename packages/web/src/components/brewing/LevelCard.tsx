import { type BrewingState, logExpSchema } from '@awesomeness-mgmt/shared'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import LevelDialog from '@/components/brewing/LevelDialog'
import { parseWhole, percentOf } from '@/components/brewing/progress'
import BracketPanel from '@/components/ledger/BracketPanel'
import StatBox from '@/components/ledger/StatBox'
import { useLogExp } from '@/hooks/mutations/useBrewingMutations'
import { errorMessage } from '@/lib/errorMessages'

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
    <BracketPanel aria-label="Potion making level">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '64px minmax(0, 1fr)',
          gap: 5,
          alignItems: 'center',
        }}
      >
        <StatBox value={state.level} label="Level" accent />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 3,
            }}
          >
            <Typography variant="title" component="h2">
              Potion Making
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <Typography variant="capsSm">
                {state.exp} / {state.expToNext}
              </Typography>
              <Typography variant="capsXs">Exp</Typography>
              <Button variant="quiet" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            aria-label={`${Math.round(progress)}% of the way to the next level`}
          />

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}
          >
            <Input
              type="number"
              placeholder="exp"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              inputProps={{ min: 1, 'aria-label': 'Exp to log' }}
              sx={{ width: 96 }}
            />
            <Button type="submit" disabled={!parsed.success || addExp.isPending}>
              Log exp
            </Button>
          </Box>

          {addExp.isError ? <Alert severity="error">{errorMessage(addExp.error)}</Alert> : null}
        </Box>
      </Box>

      {editing ? (
        <LevelDialog characterId={characterId} state={state} onClose={() => setEditing(false)} />
      ) : null}
    </BracketPanel>
  )
}
