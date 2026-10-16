import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { RestKind } from '@player-ledger/shared'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useTakeRest } from '@/hooks/mutations/useRestMutations'
import RestConfirmDialog from './RestConfirmDialog'

export default function RestToolbar() {
  const { character } = useActiveCharacter()
  const takeRest = useTakeRest(character.id)
  const [confirming, setConfirming] = useState<RestKind | null>(null)

  function open(kind: RestKind) {
    takeRest.reset()
    setConfirming(kind)
  }

  function confirm(kind: RestKind) {
    takeRest.mutate(kind, { onSuccess: () => setConfirming(null) })
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button onClick={() => open('short')}>Short Rest</Button>
      <Button onClick={() => open('long')}>Long Rest</Button>
      <RestConfirmDialog
        kind={confirming}
        isPending={takeRest.isPending}
        error={takeRest.error}
        onCancel={() => setConfirming(null)}
        onConfirm={confirm}
      />
    </Box>
  )
}
