import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import BracketPanel from '@/components/ledger/BracketPanel'

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
        p: 6,
        bgcolor: 'background.default',
      }}
    >
      <BracketPanel
        role="alert"
        sx={{ maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Typography variant="title" component="h1">
          {title}
        </Typography>
        <Typography variant="body1">{detail}</Typography>
        {action && (
          <Button onClick={action.onAction} sx={{ alignSelf: 'flex-start' }}>
            {action.label}
          </Button>
        )}
      </BracketPanel>
    </Box>
  )
}
