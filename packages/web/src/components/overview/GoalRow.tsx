import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import type { Goal } from '@player-ledger/shared'
import RuledRow from '@/components/ledger/RuledRow'

export type GoalRowProps = {
  goal: Goal
  onToggle: (done: boolean) => void
  onRemove: () => void
  disabled: boolean
}

export default function GoalRow({ goal, onToggle, onRemove, disabled }: GoalRowProps) {
  const id = `goal-${goal.id}`
  return (
    <RuledRow columns="28px minmax(0, 1fr) 36px">
      <Checkbox
        id={id}
        checked={goal.done}
        onChange={(event) => onToggle(event.target.checked)}
        sx={{ p: 0 }}
      />
      <Typography variant="body1" component="label" htmlFor={id} data-done={goal.done}>
        {goal.text}
      </Typography>
      <Box data-row-actions>
        <IconButton aria-label={`Remove ${goal.text}`} onClick={onRemove} disabled={disabled}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </RuledRow>
  )
}
