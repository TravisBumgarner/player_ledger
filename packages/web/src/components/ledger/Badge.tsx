import { styled } from '@mui/material/styles'
import { RADIUS, TYPE } from '@/theme/tokens'

/** A small bordered count or tag. */
const Badge = styled('span')(({ theme }) => ({
  ...TYPE.bodySm,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
  height: 28,
  padding: '0 8px',
  boxSizing: 'border-box',
  border: `1px solid ${theme.palette.ledger.line2}`,
  borderRadius: RADIUS.badge,
  color: theme.palette.ledger.text,
  '&[data-tag="true"]': { ...TYPE.capsXs, height: 24, color: theme.palette.ledger.muted },
}))

export default Badge
