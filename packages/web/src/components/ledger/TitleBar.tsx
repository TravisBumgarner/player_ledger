import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import IdentityMenu from '@/components/identity/IdentityMenu'
import { useCurrentIdentity } from '@/hooks/queries/useIdentity'
import { LAYOUT } from '@/theme/tokens'

/**
 * The window's own title bar: Electron hides the native one (hiddenInset) and keeps the
 * traffic lights in the reserved inset. The bar drags the window; its controls must not.
 */
export default function TitleBar({ actions }: { actions?: ReactNode }) {
  const { character } = useCurrentIdentity()

  return (
    <Box
      component="header"
      sx={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        minHeight: LAYOUT.titleBarHeight,
        boxSizing: 'border-box',
        pl: `${LAYOUT.trafficLightInset}px`,
        pr: 5,
        borderBottom: 1,
        borderColor: 'ledger.line',
        WebkitAppRegion: 'drag',
        '& button, & a, & input': { WebkitAppRegion: 'no-drag' },
      }}
    >
      <Typography variant="capsSm" sx={{ color: 'ledger.muted' }}>
        {character ? `${character.name}'s Ledger` : 'Ledger'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {actions}
        <IdentityMenu />
      </Box>
    </Box>
  )
}
