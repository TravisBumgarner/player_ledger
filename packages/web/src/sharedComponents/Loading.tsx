import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

/** Placeholder copy. Replace with the real ones; the count does not matter. */
const LOADING_MESSAGES = ['Fetching', 'Sorting things out', 'Almost there']

const pick = () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]

export type LoadingProps = {
  /** Names what is being waited on, for a reader who cannot see the spinner. */
  label?: string
  /** A line of flavour under the spinner, drawn once per mount. */
  message?: boolean
  /** Take the slack in the column it sits in, the way `NoData` does. */
  grow?: boolean
  size?: number
}

/**
 * Every wait, in one shape. Centred on both axes — unlike an empty state, which
 * is a sentence to read, this is a thing to look at while nothing has arrived.
 */
export default function Loading({
  label = 'Loading',
  message = false,
  grow = false,
  size = 32,
}: LoadingProps) {
  // Once per mount: a message that changed on every render would be a second
  // thing moving on a screen that is already saying "wait".
  const [line] = useState(pick)

  return (
    <Box
      sx={{
        flexGrow: grow ? 1 : 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        p: '16px 12px',
      }}
    >
      <CircularProgress size={size} aria-label={label} />

      {message ? (
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          {line}...
        </Typography>
      ) : null}
    </Box>
  )
}
