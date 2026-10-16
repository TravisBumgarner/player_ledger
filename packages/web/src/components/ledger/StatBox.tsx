import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { LAYOUT, RADIUS } from '@/theme/tokens'

const Box = styled('div', { shouldForwardProp: (prop) => prop !== 'accent' })<{ accent: boolean }>(
  ({ theme, accent }) => ({
    width: LAYOUT.statBox.w,
    height: LAYOUT.statBox.h,
    flex: 'none',
    boxSizing: 'border-box',
    border: `1px solid ${accent ? theme.palette.ledger.accent : theme.palette.ledger.line2}`,
    borderRadius: RADIUS.control,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: accent ? theme.palette.ledger.accent : theme.palette.ledger.text,
  }),
)

export type StatBoxProps = { value: string | number; label: string; accent?: boolean }

/** A big number over a small-caps label: a journal date, a spell or skill level. */
export default function StatBox({ value, label, accent = false }: StatBoxProps) {
  return (
    <Box accent={accent}>
      <Typography variant="stat">{value}</Typography>
      <Typography variant="capsXs">{label}</Typography>
    </Box>
  )
}
