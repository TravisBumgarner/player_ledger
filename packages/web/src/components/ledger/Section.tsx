import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import BracketPanel from './BracketPanel'
import SectionHeader from './SectionHeader'

export type SectionProps = { title: string; right?: ReactNode; children: ReactNode }

/** A heading over a bracketed card of rows: the card groups, rules only separate rows inside it. */
export default function Section({ title, right, children }: SectionProps) {
  return (
    <Box component="section" aria-label={title}>
      <SectionHeader title={title} right={right} />
      <BracketPanel
        component="div"
        sx={{
          '& .ledger-row:last-child, & > form:last-child .ledger-row, & .motion-row:last-child > .ledger-row':
            { borderBottom: 'none' },
        }}
      >
        {children}
      </BracketPanel>
    </Box>
  )
}
