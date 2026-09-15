import { createGoalSchema } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useCreateGoal, useDeleteGoal, useToggleGoal } from '@/hooks/mutations/useJournalMutations'
import { useGoals } from '@/hooks/queries/useJournal'
import { errorMessage } from '@/lib/errorMessages'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import SectionLabel from '@/sharedComponents/SectionLabel'
import GoalRow from './GoalRow'

export default function GoalsCard() {
  const { character } = useActiveCharacter()
  const goals = useGoals(character.id)
  const createGoal = useCreateGoal(character.id)
  const toggleGoal = useToggleGoal(character.id)
  const deleteGoal = useDeleteGoal(character.id)
  const [text, setText] = useState('')

  const parsed = createGoalSchema.safeParse({ text })
  const mutationError = createGoal.error ?? toggleGoal.error ?? deleteGoal.error

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) return
    createGoal.mutate(parsed.data, { onSuccess: () => setText('') })
  }

  return (
    <Box component="section" sx={{ display: 'grid', gap: '10px' }}>
      <SectionLabel>Goals</SectionLabel>
      <Paper variant="section">
        {goals.isPending ? (
          <Loading size={20} label="Loading goals" />
        ) : goals.isError ? (
          <LoadFailure
            dense
            error={goals.error}
            fallback="Could not load goals."
            onRetry={() => void goals.refetch()}
          />
        ) : goals.data.length === 0 ? (
          <Typography variant="body2" data-empty="true">
            No goals yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gap: 0.5 }}>
            {goals.data.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                disabled={deleteGoal.isPending}
                onToggle={(done) => toggleGoal.mutate({ goalId: goal.id, done })}
                onRemove={() => deleteGoal.mutate(goal.id)}
              />
            ))}
          </Box>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}
        >
          <TextField
            size="small"
            placeholder="new goal..."
            aria-label="New goal"
            value={text}
            onChange={(event) => setText(event.target.value)}
            sx={{ flex: 1, minWidth: 180 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!parsed.success || createGoal.isPending}
          >
            Add Goal
          </Button>
        </Box>
        {mutationError ? (
          <Typography variant="body2" role="alert">
            {errorMessage(mutationError)}
          </Typography>
        ) : null}
      </Paper>
    </Box>
  )
}
