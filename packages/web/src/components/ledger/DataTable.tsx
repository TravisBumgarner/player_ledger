import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import EmptyState from './EmptyState'
import { AnimatePresence } from './motion'
import RuledRow from './RuledRow'

export type DataTableProps = {
  columns: string
  /** One per column; an empty string leaves a column unlabelled. */
  headers: string[]
  empty: string
  children: ReactNode[]
}

/** RuledRows under a capsXs header row. */
export default function DataTable({ columns, headers, empty, children }: DataTableProps) {
  return (
    <div>
      <RuledRow columns={columns} sx={{ minHeight: 44 }}>
        {headers.map((header, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: headers are positional
          <Typography key={index} variant="capsXs">
            {header}
          </Typography>
        ))}
      </RuledRow>
      {children.length === 0 ? (
        <EmptyState inset>{empty}</EmptyState>
      ) : (
        <AnimatePresence initial={false}>{children}</AnimatePresence>
      )}
    </div>
  )
}
