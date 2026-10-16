import type { RichDoc } from '@awesomeness-mgmt/shared'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import type { AnyExtension } from '@tiptap/react'
import { type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from 'react'
import RichTextEditor from '@/sharedComponents/RichTextEditor/RichTextEditor'
import { type EntryValue, useAutosave } from '@/sharedComponents/RichTextEditor/useAutosave'
import BracketPanel from '../BracketPanel'
import type { SaveState } from '../SaveStatus'
import DateBox from './DateBox'

export type JournalEntryItem = { id: string; label: string; body: RichDoc }

export type JournalEntryProps = {
  entry: JournalEntryItem
  editing: boolean
  onEdit: () => void
  onDoneEditing: () => void
  onSave: (value: EntryValue) => Promise<void>
  onRemove: () => void
  onStateChange: (state: SaveState) => void
  bodyPlaceholder: string
  extensions?: AnyExtension[]
}

export default function JournalEntry({
  entry,
  editing,
  onEdit,
  onDoneEditing,
  onSave,
  onRemove,
  onStateChange,
  bodyPlaceholder,
  extensions,
}: JournalEntryProps) {
  const { draft, state, change, flush } = useAutosave(
    { label: entry.label, body: entry.body },
    onSave,
  )
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const readBody = useRef<HTMLDivElement>(null)
  const returnFocus = useRef(false)

  const onStateChangeRef = useRef(onStateChange)
  onStateChangeRef.current = onStateChange
  useEffect(() => onStateChangeRef.current(state), [state])

  // Back to the entry it left, so a keyboard user is not dropped at the top of the page.
  useEffect(() => {
    if (editing || !returnFocus.current) return
    returnFocus.current = false
    readBody.current?.focus()
  }, [editing])

  function done(keepFocus: boolean) {
    flush()
    returnFocus.current = keepFocus
    onDoneEditing()
  }

  // The editor reports its own Escape; this covers the label field.
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !editing || event.defaultPrevented) return
    event.preventDefault()
    done(true)
  }

  function handleReadClick(event: MouseEvent) {
    // A mention or link is its own target, not a way into the editor.
    if ((event.target as HTMLElement).closest('a, [data-mention-ref]')) return
    onEdit()
  }

  function handleReadKeyDown(event: KeyboardEvent) {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onEdit()
  }

  return (
    <ClickAwayListener onClickAway={() => editing && done(false)}>
      <BracketPanel
        component="article"
        active={editing}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) flush()
        }}
        sx={{
          display: 'grid',
          gridTemplateColumns: '64px minmax(0, 1fr) 36px',
          gap: 5,
          '& [data-more]': { opacity: editing ? 1 : 0.35 },
          '&:hover [data-more], &:focus-within [data-more], & [data-more][aria-expanded="true"]': {
            opacity: 1,
          },
        }}
      >
        <DateBox label={draft.label} />

        {editing ? (
          <Box sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
            <RichTextEditor
              value={draft.body}
              onChange={(body, isEmpty) => change({ body: isEmpty ? null : body })}
              placeholder={bodyPlaceholder}
              extensions={extensions}
              toolbar="minimal"
              toolbarBelow
              toolbarEnd={<Button onClick={() => done(true)}>Done</Button>}
              autoFocus
              onEscape={() => done(true)}
              aria-label={`Entry: ${draft.label}`}
            />
          </Box>
        ) : (
          // biome-ignore lint/a11y/useSemanticElements: holds rich text, which a <button> cannot
          <Box
            ref={readBody}
            role="button"
            tabIndex={0}
            aria-label={`Edit ${draft.label || 'entry'}`}
            onClick={handleReadClick}
            onKeyDown={handleReadKeyDown}
            sx={{ minWidth: 0, cursor: 'text' }}
          >
            <RichTextEditor
              value={draft.body}
              editable={false}
              extensions={extensions}
              aria-label={`Entry: ${draft.label}`}
            />
          </Box>
        )}

        <Box>
          <IconButton
            data-more
            aria-label={`Options for ${draft.label || 'entry'}`}
            aria-haspopup="menu"
            aria-expanded={menuAnchor !== null}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={menuAnchor !== null}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              data-destructive="true"
              onClick={() => {
                setMenuAnchor(null)
                onRemove()
              }}
            >
              Remove
            </MenuItem>
          </Menu>
        </Box>
      </BracketPanel>
    </ClickAwayListener>
  )
}
