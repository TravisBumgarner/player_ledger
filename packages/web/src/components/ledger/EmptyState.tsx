import Typography from '@mui/material/Typography'
import RuledRow from './RuledRow'

export default function EmptyState({
  children,
  inset = false,
}: {
  children: string
  inset?: boolean
}) {
  return (
    <RuledRow columns={inset ? '28px 1fr' : '1fr'}>
      {inset ? <span /> : null}
      <Typography variant="body1" data-empty="true">
        {children}
      </Typography>
    </RuledRow>
  )
}
