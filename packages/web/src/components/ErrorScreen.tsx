import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

export type ErrorScreenProps = {
  /** The whole of what happened, in three or four words. */
  title: string
  detail: string
  action?: { label: string; onAction: () => void }
}

export default function ErrorScreen({ title, detail, action }: ErrorScreenProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        backgroundColor: 'background.default',
      }}
    >
      <Paper
        variant="panel"
        role="alert"
        sx={{
          maxWidth: 420,
          width: '100%',
          p: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        <Typography variant="body2">{detail}</Typography>
        {action && (
          <Button variant="contained" onClick={action.onAction} sx={{ alignSelf: 'flex-start' }}>
            {action.label}
          </Button>
        )}
      </Paper>
    </Box>
  )
}
