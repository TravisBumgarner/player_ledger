import type { RestKind } from '@awesomeness-mgmt/shared'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { errorMessage } from '@/lib/errorMessages'

const COPY: Record<RestKind, { title: string; message: string; confirm: string }> = {
  short: {
    title: 'Take a Short Rest?',
    message: 'This refills any consumables and spell slots set to reset on short rest.',
    confirm: 'Take Short Rest',
  },
  long: {
    title: 'Take a Long Rest?',
    message: 'This refills everything set to reset on short or long rest.',
    confirm: 'Take Long Rest',
  },
}

export type RestConfirmDialogProps = {
  /** Which rest is being asked about; null keeps the dialog closed. */
  kind: RestKind | null
  isPending: boolean
  error: unknown
  onCancel: () => void
  onConfirm: (kind: RestKind) => void
}

export default function RestConfirmDialog({
  kind,
  isPending,
  error,
  onCancel,
  onConfirm,
}: RestConfirmDialogProps) {
  // Held through the close transition so the copy does not blank out as it fades.
  const copy = COPY[kind ?? 'short']

  return (
    <Dialog open={kind !== null} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>
        Rest
        <Typography variant="h4" component="span" display="block">
          {copy.title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{copy.message}</DialogContentText>
        {error ? <DialogContentText role="alert">{errorMessage(error)}</DialogContentText> : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          variant="contained"
          disabled={isPending}
          onClick={() => kind && onConfirm(kind)}
          autoFocus
        >
          {isPending ? 'Resting…' : copy.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
