import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'
import RestoreBackupDialog from '@/components/RestoreBackupDialog'
import SettingsDialog from '@/components/SettingsDialog'
import { useCreateBackup } from '@/hooks/mutations/useBackupMutations'
import { useCurrentIdentity } from '@/hooks/queries/useIdentity'
import { errorMessage } from '@/lib/errorMessages'
import { useSetCharacterId, useSetUserId } from '@/store/useIdentityStore'

/** The character's avatar: settings, and the way back to either picker. */
export default function IdentityMenu() {
  const { user, character } = useCurrentIdentity()
  const setUserId = useSetUserId()
  const setCharacterId = useSetCharacterId()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const backup = useCreateBackup()
  const [restoreOpen, setRestoreOpen] = useState(false)

  if (!user || !character) return null

  const close = () => {
    setAnchor(null)
    backup.reset()
  }

  return (
    <>
      <IconButton
        aria-label={`${character.name}, played by ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={anchor ? 'true' : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ p: 0 }}
      >
        <Avatar sx={{ width: 34, height: 34 }}>{character.name.charAt(0).toUpperCase()}</Avatar>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={anchor !== null}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: '7px 10px' }}>
          <ListItemText primary={character.name} secondary={`Played by ${user.name}`} />
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            close()
            setSettingsOpen(true)
          }}
        >
          Settings
        </MenuItem>
        {/* Stays open so the result is seen where it was asked for. */}
        <MenuItem disabled={backup.isPending} onClick={() => backup.mutate()}>
          {backup.isPending
            ? 'Backing up…'
            : backup.isError
              ? errorMessage(backup.error)
              : backup.isSuccess
                ? 'Backed up'
                : 'Backup'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            close()
            setRestoreOpen(true)
          }}
        >
          Restore backup
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            close()
            setCharacterId(null)
          }}
        >
          Change character
        </MenuItem>
        <MenuItem
          onClick={() => {
            close()
            setUserId(null)
          }}
        >
          Change user
        </MenuItem>
      </Menu>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <RestoreBackupDialog open={restoreOpen} onClose={() => setRestoreOpen(false)} />
    </>
  )
}
