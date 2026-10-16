import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export type SectionHeaderProps = {
  title: string
  /** A count Badge, a text action, or a SaveStatus. */
  right?: ReactNode
}

/** A capsMd label above the section's card. */
export default function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        minHeight: 36,
        mb: 3,
      }}
    >
      <Typography variant="capsMd" sx={{ color: 'text.primary' }}>
        {title}
      </Typography>
      {right}
    </Box>
  )
}
