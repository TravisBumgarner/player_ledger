import { createGoalSchema } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import AddRow from '@/components/ledger/AddRow'
import Badge from '@/components/ledger/Badge'
import { AnimatePresence, MotionRow } from '@/components/ledger/motion'
import Section from '@/components/ledger/Section'
import { useCreateGoal, useDeleteGoal, useToggleGoal } from '@/hooks/mutations/useJournalMutations'
import { useGoals } from '@/hooks/queries/useJournal'
import { errorMessage } from '@/lib/errorMessages'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import GoalRow from './GoalRow'

export default function GoalsCard() {
  const { character } = useActiveCharacter()
  const goals = useGoals(character.id)
  const createGoal = useCreateGoal(character.id)
  const toggleGoal = useToggleGoal(character.id)
  const deleteGoal = useDeleteGoal(character.id)

  const mutationError = createGoal.error ?? toggleGoal.error ?? deleteGoal.error
  const done = goals.data?.filter((goal) => goal.done).length ?? 0
  const [showCompleted, setShowCompleted] = useState(false)

  return (
    <Section
      title="Goals"
      right={
        goals.data ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showCompleted}
                  onChange={(event) => setShowCompleted(event.target.checked)}
                  sx={{ p: 1 }}
                />
              }
              label="Show completed"
            />
            <Badge>{`${done}/${goals.data.length}`}</Badge>
          </Box>
        ) : null
      }
    >
      {goals.isPending ? (
        <Loading size={20} label="Loading goals" />
      ) : goals.isError ? (
        <LoadFailure
          dense
          error={goals.error}
          fallback="Could not load goals."
          onRetry={() => void goals.refetch()}
        />
      ) : (
        <AnimatePresence initial={false}>
          {goals.data
            .filter((goal) => showCompleted || !goal.done)
            .map((goal) => (
              <MotionRow key={goal.id}>
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  disabled={deleteGoal.isPending}
                  onToggle={(next) => toggleGoal.mutate({ goalId: goal.id, done: next })}
                  onRemove={() => deleteGoal.mutate(goal.id)}
                />
              </MotionRow>
            ))}
        </AnimatePresence>
      )}
      <AddRow
        placeholder="Add a goal…"
        label="New goal"
        maxLength={500}
        disabled={createGoal.isPending}
        onAdd={async (text) => {
          const parsed = createGoalSchema.safeParse({ text })
          if (parsed.success) await createGoal.mutateAsync(parsed.data)
        }}
      />
      {mutationError ? (
        <Typography variant="caption" role="alert" sx={{ color: 'error.main' }}>
          {errorMessage(mutationError)}
        </Typography>
      ) : null}
    </Section>
  )
}
