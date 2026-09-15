import type { Goal } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import TextAction from '@/sharedComponents/TextAction'

export type GoalRowProps = {
  goal: Goal
  onToggle: (done: boolean) => void
  onRemove: () => void
  disabled: boolean
}

export default function GoalRow({ goal, onToggle, onRemove, disabled }: GoalRowProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <FormControlLabel
        sx={{ flex: 1, minWidth: 0, mr: 0, ml: '-9px' }}
        control={
          <Checkbox
            size="small"
            checked={goal.done}
            onChange={(event) => onToggle(event.target.checked)}
          />
        }
        label={
          <Typography variant="body1" component="span" data-done={goal.done}>
            {goal.text}
          </Typography>
        }
      />
      <TextAction onClick={onRemove} disabled={disabled}>
        Remove
      </TextAction>
    </Box>
  )
}
