import Typography from '@mui/material/Typography'
import { useState } from 'react'

export type SaveState =
  | { kind: 'saved' }
  | { kind: 'saving' }
  | { kind: 'invalid' }
  | { kind: 'error'; message: string }

const TEXT: Record<Exclude<SaveState['kind'], 'error'>, string> = {
  saved: 'All changes saved',
  saving: 'Saving…',
  invalid: 'Not saved — an entry needs some text',
}

/** One per page: lift it to the page with `useSaveState` and hand the setter down. */
export function useSaveState() {
  return useState<SaveState>({ kind: 'saved' })
}

export default function SaveStatus({ state }: { state: SaveState }) {
  const failed = state.kind === 'error' || state.kind === 'invalid'
  return (
    <Typography
      variant="caption"
      role={failed ? 'alert' : 'status'}
      sx={{ whiteSpace: 'nowrap', color: failed ? 'error.main' : undefined }}
    >
      {state.kind === 'error' ? state.message : TEXT[state.kind]}
    </Typography>
  )
}
