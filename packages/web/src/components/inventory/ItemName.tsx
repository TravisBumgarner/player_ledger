import type { InventoryItem } from '@awesomeness-mgmt/shared'
import Typography from '@mui/material/Typography'

/** Used gear is struck through; `<s>` keeps that meaning for screen readers too. */
export default function ItemName({
  item,
  variant = 'body1',
}: {
  item: InventoryItem
  variant?: 'body1' | 'h5'
}) {
  const used = item.type === 'gear' && item.used

  return (
    <Typography
      variant={variant}
      component={used ? 's' : 'span'}
      data-done={used}
      sx={{ overflowWrap: 'anywhere' }}
    >
      {item.name}
    </Typography>
  )
}
