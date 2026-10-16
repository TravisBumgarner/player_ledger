import { styled } from '@mui/material/styles'
import type { ComponentProps } from 'react'
import { LAYOUT } from '@/theme/tokens'

/**
 * One row of a ruled list: a CSS grid whose template is passed in. Actions belong in a
 * fixed-width trailing column, so hovering or adding a row never shifts anything sideways.
 */
const StyledRow = styled('div', {
  shouldForwardProp: (prop) => prop !== 'columns' && prop !== 'dimmed',
})<{
  columns: string
  dimmed?: boolean
}>(({ theme, columns, dimmed = false }) => ({
  display: 'grid',
  gridTemplateColumns: columns,
  alignItems: 'center',
  columnGap: 16,
  minHeight: LAYOUT.rowMinHeight,
  borderBottom: `1px solid ${theme.palette.ledger.line}`,
  opacity: dimmed ? 0.6 : 1,
  '& [data-row-actions]': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    opacity: 0.45,
    transition: 'opacity 120ms ease-out',
  },
  '&:hover [data-row-actions], &:focus-within [data-row-actions]': { opacity: 1 },
}))

/** The class lets a container drop the rule under its last row. */
const RuledRow = (props: ComponentProps<typeof StyledRow>) => (
  <StyledRow {...props} className={['ledger-row', props.className].filter(Boolean).join(' ')} />
)

export default RuledRow
