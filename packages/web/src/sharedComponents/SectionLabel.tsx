import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

export type SectionLabelProps = {
  children: string
  /** Vertical rhythm only. A menu sits tighter than a panel; the band itself is the same. */
  sx?: Parameters<typeof Paper>[0]['sx']
}

/** The one band every grouped list heads with, so adjacent panels never disagree on it. */
export default function SectionLabel({ children, sx }: SectionLabelProps) {
  return (
    <Paper variant="strip" data-strong="true" sx={{ p: '6px 10px', ...sx }}>
      <Typography variant="overline" component="h3" color="text.secondary" noWrap>
        {children}
      </Typography>
    </Paper>
  )
}
