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
  // Rotated, the corners reach ~21% past the box; the margin keeps a clipping parent from cutting them.
  margin: `${Math.ceil(size * 0.21)}px`,
  ...(filled
    ? { backgroundColor: theme.palette.ledger.accent }
    : { border: `1px solid ${theme.palette.ledger.line2}` }),
}))

export default Diamond
