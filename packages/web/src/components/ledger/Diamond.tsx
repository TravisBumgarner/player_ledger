import { styled } from '@mui/material/styles'
import { LAYOUT } from '@/theme/tokens'

/** The ledger's marker: filled for active or present, hollow for empty or available. */
const Diamond = styled('span', {
  shouldForwardProp: (prop) => prop !== 'filled' && prop !== 'size',
})<{
  filled?: boolean
  size?: number
}>(({ theme, filled = false, size = LAYOUT.diamond.nav }) => ({
  width: size,
  height: size,
  flex: 'none',
  boxSizing: 'border-box',
  transform: 'rotate(45deg)',
  ...(filled
    ? { backgroundColor: theme.palette.ledger.accent }
    : { border: `1px solid ${theme.palette.ledger.line2}` }),
}))

export default Diamond
