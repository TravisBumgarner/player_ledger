import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

/** The single content column, as wide as the window. Nothing sits side by side, so a new row only pushes content down. */
export default function Page({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {children}
    </Box>
  )
}
