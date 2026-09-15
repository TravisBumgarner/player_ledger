import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import AppHeader from '@/components/AppHeader'
import { MAX_CONTENT_WIDTH, SPACING } from '@/styles/styleConsts'

export default function AppShell({
  wide = false,
  children,
}: {
  /** For a page that owns its own padding; the reading-width column would crop a grid. */
  wide?: boolean
  children: ReactNode
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppHeader />

      <Box
        component="main"
        sx={
          wide
            ? { flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column' }
            : {
                flexGrow: 1,
                width: '100%',
                maxWidth: MAX_CONTENT_WIDTH,
                mx: 'auto',
                p: SPACING.page,
                // A column, so a page that asks to fill the shell can. Children
                // with no `flex` of their own still stack from the top.
                display: 'flex',
                flexDirection: 'column',
              }
        }
      >
        {children}
      </Box>
    </Box>
  )
}
