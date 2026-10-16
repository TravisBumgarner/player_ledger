import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useState } from 'react'
import { useBackups, useRestoreBackup } from '@/hooks/mutations/useBackupMutations'
import { errorMessage } from '@/lib/errorMessages'
import Loading from '@/sharedComponents/Loading'

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export default function RestoreBackupDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const backups = useBackups(open)
  const restore = useRestoreBackup()
  const [selected, setSelected] = useState<string | null>(null)

  function close() {
    setSelected(null)
    restore.reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle>Restore a backup</DialogTitle>
      <DialogContent>
        {restore.isSuccess ? (
          <DialogContentText role="status">
            Restored. What it replaced was saved as a new backup first.
          </DialogContentText>
        ) : (
          <>
            <DialogContentText>
              Everything is replaced with the backup you pick. Your current data is backed up first,
              so this can be undone.
            </DialogContentText>
            {backups.isPending ? (
              <Loading size={20} label="Loading backups" />
            ) : backups.isError ? (
              <DialogContentText role="alert">{errorMessage(backups.error)}</DialogContentText>
            ) : backups.data.length === 0 ? (
              <DialogContentText data-empty="true">No backups yet.</DialogContentText>
            ) : (
              <List sx={{ maxHeight: 280, overflowY: 'auto', mt: 3 }}>
                {backups.data.map((backup) => (
                  <ListItemButton
                    key={backup.name}
                    selected={selected === backup.name}
                    onClick={() => setSelected(backup.name)}
                  >
                    <ListItemText
                      primary={when(backup.createdAt)}
                      secondary={`${Math.round(backup.bytes / 1024)} KB`}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
            {restore.error ? (
              <DialogContentText role="alert">{errorMessage(restore.error)}</DialogContentText>
            ) : null}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {restore.isSuccess ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="quiet" onClick={close}>
              Cancel
            </Button>
            <Button
              color="error"
              disabled={!selected || restore.isPending}
              onClick={() => selected && restore.mutate(selected)}
            >
              {restore.isPending ? 'Restoring…' : 'Restore'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
