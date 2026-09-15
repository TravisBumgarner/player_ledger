import Box from '@mui/material/Box'
import type { ButtonProps } from '@mui/material/Button'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export type NoDataAction = {
  label: string
  onClick: () => void
  variant?: ButtonProps['variant']
}

export type NoDataProps = {
  message: string
  actions?: NoDataAction[]
  /** How the calls to action stack under the message. */
  direction?: 'row' | 'column'
  /**
   * Take the slack in the column it sits in. A panel whose whole body is this
   * wants it; a grid cell standing in for the rows that are missing does not,
   * and a stretched one there pushes the filters it is explaining off screen.
   */
  grow?: boolean
}

/**
 * The one shape for "there is nothing to show you", centred in the space it is
 * given and centred inside it. These sit in the middle of an empty panel with
 * nothing to line up against, and a left edge floating in the centre of a column
 * reads as a paragraph that lost its page.
 */
export default function NoData({
  message,
  actions = [],
  direction = 'column',
  grow = false,
}: NoDataProps) {
  return (
    <Box
      sx={{
        flexGrow: grow ? 1 : 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: '16px 12px',
      }}
    >
      <Box
        sx={{
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Typography variant="body2" align="center">
          {message}
        </Typography>

        {actions.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: direction,
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? 'outlined'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
