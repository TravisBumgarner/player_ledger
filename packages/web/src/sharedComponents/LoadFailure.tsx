import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ApiError } from '@/lib/ApiError'

/**
 * A read that failed is not a thing that does not exist, and saying the second
 * when the first happened sends people off to make something they already have.
 * Each reason gets the recovery that actually applies to it.
 */
export function failureReason(
  error: unknown,
  fallback: string,
): { text: string; canRetry: boolean } {
  const code = error instanceof ApiError ? error.errorCode : null

  switch (code) {
    case 'NOT_FOUND':
      return { text: 'That is no longer there.', canRetry: false }
    case 'RATE_LIMITED':
      return { text: 'Too many requests at once. Give it a moment and try again.', canRetry: true }
    default:
      // Includes the network failure, which is the common one and carries no code.
      return { text: fallback, canRetry: true }
  }
}

export type LoadFailureProps = {
  error: unknown
  /** What could not be read, said plainly. Used when the error names no reason of its own. */
  fallback: string
  onRetry?: () => void
  /** Compact enough for a panel; the default fills the space it is given. */
  dense?: boolean
}

export default function LoadFailure({ error, fallback, onRetry, dense = false }: LoadFailureProps) {
  const reason = failureReason(error, fallback)

  return (
    <Box
      role="alert"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: dense ? 'flex-start' : 'center',
        justifyContent: dense ? 'flex-start' : 'center',
        gap: '12px',
        p: dense ? '6px 10px' : 2,
        ...(dense ? {} : { height: '100%', maxWidth: 360, mx: 'auto', textAlign: 'center' }),
      }}
    >
      <Typography variant="body2">{reason.text}</Typography>

      {reason.canRetry && onRetry ? (
        <Button
          variant={dense ? 'text' : 'contained'}
          size={dense ? 'small' : 'medium'}
          onClick={onRetry}
        >
          Try again
        </Button>
      ) : null}
    </Box>
  )
}
