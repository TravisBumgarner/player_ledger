import { type Modifier, updateModifierSchema } from '@awesomeness-mgmt/shared'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import { useRef, useState } from 'react'
import Diamond from '@/components/ledger/Diamond'
import RuledRow from '@/components/ledger/RuledRow'

export type ModifierRowProps = {
  modifier: Modifier
  onRename: (text: string) => void
  onRemove: () => void
  disabled: boolean
}

/** Saves on blur or Enter; Escape, or a title cleared to nothing, puts the old one back. */
export default function ModifierRow({ modifier, onRename, onRemove, disabled }: ModifierRowProps) {
  // Null while not editing, so a rename that lands from the server shows up here.
  const [draft, setDraft] = useState<string | null>(null)
  // Escape blurs synchronously, before the reset draft reaches `commit`'s closure.
  const discard = useRef(false)

  function commit() {
    const discarded = discard.current
    discard.current = false
    setDraft(null)
    if (draft === null || discarded) return
    const parsed = updateModifierSchema.safeParse({ text: draft })
    if (!parsed.success || parsed.data.text === modifier.text) return
    onRename(parsed.data.text)
  }

  return (
    <RuledRow columns="28px minmax(0, 1fr) 36px">
      <Diamond filled />
      <InputBase
        value={draft ?? modifier.text}
        onFocus={() => setDraft((current) => current ?? modifier.text)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          discard.current = event.key === 'Escape'
          if (event.key !== 'Enter' && event.key !== 'Escape') return
          event.preventDefault()
          ;(event.target as HTMLElement).blur()
        }}
        inputProps={{ maxLength: 200, 'aria-label': 'Modifier' }}
      />
      <Box data-row-actions>
        <IconButton aria-label={`Remove ${modifier.text}`} onClick={onRemove} disabled={disabled}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </RuledRow>
  )
}
