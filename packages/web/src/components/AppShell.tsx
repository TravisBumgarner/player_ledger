import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import TitleBar from '@/components/ledger/TitleBar'
import { LAYOUT } from '@/theme/tokens'

/** The window: title bar over whatever fills it. Only the content area scrolls. */
export default function AppShell({
  headerActions,
  ledger = false,
  children,
}: {
  headerActions?: ReactNode
  /** The ledger lays out its own sidebar and columns; anything else gets one centred column. */
  ledger?: boolean
  children: ReactNode
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <TitleBar actions={headerActions} />
      <Box component="main" sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {ledger ? (
          children
        ) : (
          <Box sx={{ flex: 1, overflowY: 'auto', px: 12, py: 10 }}>
            <Box sx={{ maxWidth: LAYOUT.contentMaxWidth, mx: 'auto' }}>{children}</Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
