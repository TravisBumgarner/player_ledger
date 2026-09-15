import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import IconButton from '@mui/material/IconButton'

/** The star on every spell and item: pinned ones also show on Overview. */
export default function PinButton({
  pinned,
  name,
  onToggle,
  disabled = false,
}: {
  pinned: boolean
  /** What is being pinned, for the accessible label. */
  name: string
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <IconButton
      size="small"
      aria-pressed={pinned}
      aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`}
      onClick={onToggle}
      disabled={disabled}
    >
      {pinned ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
    </IconButton>
  )
}
