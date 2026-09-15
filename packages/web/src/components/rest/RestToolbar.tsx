import type { RestKind } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useTakeRest } from '@/hooks/mutations/useRestMutations'
import { useRest } from '@/hooks/queries/useRest'
import RestConfirmDialog from './RestConfirmDialog'

export default function RestToolbar() {
  const { character } = useActiveCharacter()
  const rest = useRest(character.id)
  const takeRest = useTakeRest(character.id)
  const [confirming, setConfirming] = useState<RestKind | null>(null)

  function open(kind: RestKind) {
    takeRest.reset()
    setConfirming(kind)
  }

  function confirm(kind: RestKind) {
    takeRest.mutate(kind, { onSuccess: () => setConfirming(null) })
  }

  const counts = rest.data
    ? `${rest.data.shortRests} short · ${rest.data.longRests} long today`
    : rest.isError
      ? 'Rest count unavailable'
      : ' '

  return (
    <Paper
      variant="surface"
      data-edge="bottom"
      square
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        columnGap: 1.25,
        rowGap: 1,
      }}
    >
      <Typography variant="overline" component="span">
        Rest:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size="small" onClick={() => open('short')}>
          Short Rest
        </Button>
        <Button size="small" onClick={() => open('long')}>
          Long Rest
        </Button>
      </Box>
      <Typography variant="body2" component="span" aria-live="polite">
        {counts}
      </Typography>

      <RestConfirmDialog
        kind={confirming}
        isPending={takeRest.isPending}
        error={takeRest.error}
        onCancel={() => setConfirming(null)}
        onConfirm={confirm}
      />
    </Paper>
  )
}
