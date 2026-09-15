import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import SectionLabel from '@/sharedComponents/SectionLabel'

const GAP = '10px'

/** Four across at most, never narrower than a card can be read at. */
const GRID_COLUMNS = `repeat(auto-fill, minmax(max(150px, calc((100% - 3 * ${GAP}) / 4)), 1fr))`

export type CardSectionProps = {
  /** A string is drawn as the heading; anything else is drawn as given. */
  label?: ReactNode
  children: ReactNode
}

/**
 * A run of cards under a heading. One grid definition for everything laid out in
 * cells, so a column count decided once is a column count everywhere.
 */
export default function CardSection({ label, children }: CardSectionProps) {
  return (
    <Box sx={{ pb: '12px' }}>
      {/* The band is the divider: a word floating over a run of cards reads as a
        caption for the first row rather than as the start of a group. */}
      {label ? (
        <Box sx={{ pb: '8px' }}>
          {typeof label === 'string' ? <SectionLabel>{label}</SectionLabel> : label}
        </Box>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          alignContent: 'start',
          gridTemplateColumns: GRID_COLUMNS,
          gap: GAP,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
