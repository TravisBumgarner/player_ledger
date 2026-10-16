import {
  BREW_HOURS_BY_RARITY,
  BREW_SESSION_HOURS,
  type BrewingState,
  type Recipe,
  startBrewSchema,
} from '@awesomeness-mgmt/shared'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import { parseWhole, percentOf } from '@/components/brewing/progress'
import EmptyState from '@/components/ledger/EmptyState'
import Section from '@/components/ledger/Section'
import {
  useClearBrew,
  useLogBrewSession,
  useStartBrew,
} from '@/hooks/mutations/useBrewingMutations'
import { errorMessage } from '@/lib/errorMessages'

export type ActiveBrewCardProps = {
  characterId: string
  state: BrewingState
  recipes: Recipe[]
}

export default function ActiveBrewCard({ characterId, state, recipes }: ActiveBrewCardProps) {
  const [startOpen, setStartOpen] = useState(false)
  const logSession = useLogBrewSession(characterId)
  const finish = useClearBrew(characterId)
  const known = recipes.filter((recipe) => recipe.known)
  const brew = state.activeBrew
  const done = brew !== null && brew.hoursLogged >= brew.hoursTotal
  const error = logSession.error ?? finish.error

  return (
    <Section
      title="Active brew"
      right={
        <Button variant="text" onClick={() => setStartOpen(!startOpen)} aria-expanded={startOpen}>
          {startOpen ? 'Cancel' : '+ Start new brew'}
        </Button>
      }
    >
      {startOpen ? (
        <Box sx={{ py: 4, borderBottom: 1, borderColor: 'ledger.line' }}>
          {known.length > 0 ? (
            <StartBrewForm
              characterId={characterId}
              known={known}
              onStarted={() => setStartOpen(false)}
            />
          ) : (
            <Typography variant="body1" data-empty="true">
              Mark a recipe as known below first.
            </Typography>
          )}
        </Box>
      ) : null}

      {brew ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            py: 4,
            borderBottom: 1,
            borderColor: 'ledger.line',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <Typography variant="title" component="p">
                {brew.name}
              </Typography>
              <Typography variant="capsXs">{brew.rarity}</Typography>
            </Box>
            <Typography variant="bodySm">
              {brew.hoursLogged} / {brew.hoursTotal} hrs · {brew.gold} gp invested
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={percentOf(brew.hoursLogged, brew.hoursTotal)}
            aria-label={`${brew.name} brewing progress`}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <Button onClick={() => logSession.mutate()} disabled={done || logSession.isPending}>
              Log a work session (+{BREW_SESSION_HOURS} hrs)
            </Button>
            {done ? (
              <>
                <Typography variant="bodySm">Ready to bottle.</Typography>
                <Button variant="text" onClick={() => finish.mutate()} disabled={finish.isPending}>
                  Finish brew
                </Button>
              </>
            ) : null}
          </Box>
        </Box>
      ) : (
        <EmptyState>
          Nothing is brewing. Start one to track its hours and the gold sunk into it.
        </EmptyState>
      )}

      {error ? <Alert severity="error">{errorMessage(error)}</Alert> : null}
    </Section>
  )
}

type StartBrewFormProps = {
  characterId: string
  known: Recipe[]
  onStarted: () => void
}

function StartBrewForm({ characterId, known, onStarted }: StartBrewFormProps) {
  const [recipeId, setRecipeId] = useState(known[0].id)
  const [gold, setGold] = useState('0')
  const start = useStartBrew(characterId)

  // A recipe unmarked while the panel is open falls back to the first one still known.
  const selected = known.find((recipe) => recipe.id === recipeId) ?? known[0]
  const parsed = startBrewSchema.safeParse({ recipeId: selected.id, gold: parseWhole(gold) })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) return
    start.mutate(parsed.data, { onSuccess: onStarted })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 1.5 }}>
      <TextField
        select
        label="Recipe"
        size="small"
        value={selected.id}
        onChange={(event) => setRecipeId(event.target.value)}
        helperText={`${BREW_HOURS_BY_RARITY[selected.rarity]} hrs to brew (${selected.rarity})`}
      >
        {known.map((recipe) => (
          <MenuItem key={recipe.id} value={recipe.id}>
            {recipe.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Gold invested"
        size="small"
        type="number"
        value={gold}
        onChange={(event) => setGold(event.target.value)}
        slotProps={{ htmlInput: { min: 0 } }}
      />
      {start.isError ? <Alert severity="error">{errorMessage(start.error)}</Alert> : null}
      <Box>
        <Button type="submit" variant="accent" disabled={!parsed.success || start.isPending}>
          Begin brewing
        </Button>
      </Box>
    </Box>
  )
}
