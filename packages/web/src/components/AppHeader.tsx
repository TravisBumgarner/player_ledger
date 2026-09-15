import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import { useNavigate } from 'react-router-dom'
import IdentityMenu from '@/components/identity/IdentityMenu'
import { useCurrentIdentity } from '@/hooks/queries/useIdentity'
import { ROUTES } from '@/lib/routes'
import { Z_INDEX } from '@/styles/styleConsts'

export default function AppHeader() {
  const navigate = useNavigate()
  const { character } = useCurrentIdentity()

  return (
    <AppBar position="sticky" sx={{ zIndex: Z_INDEX.appBar }}>
      <Toolbar sx={{ width: '100%', gap: 1 }}>
        {/* Sized to sit in a line of text rather than as a control beside one:
          the default button box is taller than the chrome row it lives in. */}
        <Button
          variant="quiet"
          onClick={() => navigate(ROUTES.home)}
          sx={{ minWidth: 0, px: '6px', py: 0, font: 'inherit' }}
        >
          {character ? `${character.name}'s Ledger` : 'Ledger'}
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <IdentityMenu />
      </Toolbar>
    </AppBar>
  )
}
