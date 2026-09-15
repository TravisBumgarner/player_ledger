import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export type CardHeaderProps = {
  title: ReactNode
  /** Right-aligned: a readout, a word-style action, or both. */
  children?: ReactNode
}

export default function CardHeader({ title, children }: CardHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Typography variant="h4" component="h2">
        {title}
      </Typography>
      {children ? (
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>{children}</Box>
      ) : null}
    </Box>
  )
}
