import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'
import SettingsDialog from '@/components/SettingsDialog'
import { useCurrentIdentity } from '@/hooks/queries/useIdentity'
import { useSetCharacterId, useSetUserId } from '@/store/useIdentityStore'

/** The character's avatar: settings, and the way back to either picker. */
export default function IdentityMenu() {
  const { user, character } = useCurrentIdentity()
  const setUserId = useSetUserId()
  const setCharacterId = useSetCharacterId()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!user || !character) return null

  const close = () => setAnchor(null)

  return (
    <>
      <IconButton
        aria-label={`${character.name}, played by ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={anchor ? 'true' : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ p: '2px' }}
      >
        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
          {character.name.charAt(0).toUpperCase()}
        </Avatar>
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
    </>
  )
}
