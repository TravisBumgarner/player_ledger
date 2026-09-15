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
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import CardHeader from '@/components/brewing/CardHeader'
import { parseWhole, percentOf } from '@/components/brewing/progress'
import {
  useClearBrew,
  useLogBrewSession,
  useStartBrew,
} from '@/hooks/mutations/useBrewingMutations'
import { errorMessage } from '@/lib/errorMessages'
import NoData from '@/sharedComponents/NoData'
import TextAction from '@/sharedComponents/TextAction'

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
    <Paper variant="section" component="section" aria-label="Active brew">
      <CardHeader title="Active Brew">
        <TextAction onClick={() => setStartOpen(!startOpen)}>
          {startOpen ? 'Cancel' : '+ Start New Brew'}
        </TextAction>
      </CardHeader>

      {startOpen ? (
        <Box>
          {known.length > 0 ? (
            <StartBrewForm
              characterId={characterId}
              known={known}
              onStarted={() => setStartOpen(false)}
            />
          ) : (
            <Typography variant="body2" component="em">
              Mark a recipe as known below first.
            </Typography>
          )}
        </Box>
      ) : null}

      {brew ? (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="h5" component="p">
              {brew.name}{' '}
              <Typography variant="caption" component="span">
                ({brew.rarity})
              </Typography>
            </Typography>
            <Typography variant="body1" component="p">
              {brew.hoursLogged} / {brew.hoursTotal} hrs · {brew.gold} gp invested
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={percentOf(brew.hoursLogged, brew.hoursTotal)}
            aria-label={`${brew.name} brewing progress`}
          />

          <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 2 }}>
            <Button
              size="small"
              onClick={() => logSession.mutate()}
              disabled={done || logSession.isPending}
              sx={{ alignSelf: 'center' }}
            >
              Log a work session (+{BREW_SESSION_HOURS} hrs)
            </Button>
            {done ? (
              <>
                <Typography variant="body2" component="p">
                  Ready to bottle.
                </Typography>
                <TextAction onClick={() => finish.mutate()} disabled={finish.isPending}>
                  Finish brew
                </TextAction>
              </>
            ) : null}
          </Box>
        </>
      ) : (
        <NoData message="Nothing is brewing. Start a new brew to track its hours and the gold sunk into it." />
      )}

      {error ? <Alert severity="error">{errorMessage(error)}</Alert> : null}
    </Paper>
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
        <Button type="submit" variant="contained" disabled={!parsed.success || start.isPending}>
          Begin Brewing
        </Button>
      </Box>
    </Box>
  )
}
