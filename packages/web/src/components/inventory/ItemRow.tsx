import type { InventoryItem } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import Badge from '@/components/ledger/Badge'
import RuledRow from '@/components/ledger/RuledRow'
import {
  useAddItemNote,
  useArchiveItem,
  useLogItemUse,
  useUpdateItem,
} from '@/hooks/mutations/useInventoryMutations'
import PinButton from '@/sharedComponents/PinButton'
import ItemName from './ItemName'
import { latestNote, resetLabel } from './itemText'
import NoteForm from './NoteForm'

export const ITEM_COLUMNS = '28px minmax(0, 1.2fr) 64px minmax(0, 1fr) 196px'

// Narrower than the theme default so all four actions fit the fixed 196px column.
const ACTION_SX = { px: 1.5, whiteSpace: 'nowrap' } as const

export type ItemRowProps = {
  item: InventoryItem
  dimmed?: boolean
  onEdit: () => void
}

export default function ItemRow({ item, dimmed = false, onEdit }: ItemRowProps) {
  const { character } = useActiveCharacter()
  const update = useUpdateItem(character.id)
  const archive = useArchiveItem(character.id)
  const addNote = useAddItemNote(character.id)
  const logUse = useLogItemUse(character.id)
  const [open, setOpen] = useState<'use' | 'note' | null>(null)

  const consumable = item.type === 'consumable'
  const note = latestNote(item)
  const qty = consumable ? `${item.remaining} / ${item.total}` : item.qtyTag

  function toggle(form: 'use' | 'note') {
    addNote.reset()
    logUse.reset()
    setOpen((current) => (current === form ? null : form))
  }

  return (
    <>
      <RuledRow columns={ITEM_COLUMNS} dimmed={dimmed} role="row">
        <Box role="cell" sx={{ display: 'flex', justifyContent: 'center' }}>
          {consumable ? null : (
            <Checkbox
              size="small"
              checked={item.used}
              disabled={update.isPending}
              onChange={(event) =>
                update.mutate({ itemId: item.id, patch: { used: event.target.checked } })
              }
              slotProps={{ input: { 'aria-label': `${item.name} used` } }}
              sx={{ m: -2 }}
            />
          )}
        </Box>

        <Box role="cell" sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 2 }}>
            <ItemName item={item} />
            {item.trackedDndBeyond ? <Badge data-tag="true">D&D Beyond</Badge> : null}
          </Box>
          {consumable ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption">{resetLabel(item.resetOn)}</Typography>
              <Button
                variant="text"
                aria-expanded={open === 'use'}
                disabled={item.remaining <= 0}
                onClick={() => toggle('use')}
              >
                Log use
              </Button>
            </Box>
          ) : null}
        </Box>

        <Box role="cell" sx={{ display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          {qty ? (
            <Badge title={qty} sx={{ maxWidth: '100%' }}>
              <Box
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {qty}
              </Box>
            </Badge>
          ) : null}
        </Box>

        <Typography role="cell" variant="bodySm" color="ledger.muted" sx={{ py: 2 }}>
          {note ? note.text : '—'}
          {note && note.more > 0 ? (
            <Typography variant="caption" component="span" sx={{ whiteSpace: 'nowrap' }}>
              {`  (+${note.more} more)`}
            </Typography>
          ) : null}
        </Typography>

        <Box role="cell" data-row-actions>
          <Button
            variant="quiet"
            size="small"
            sx={ACTION_SX}
            aria-expanded={open === 'note'}
            onClick={() => toggle('note')}
          >
            + note
          </Button>
          <Button variant="quiet" size="small" sx={ACTION_SX} onClick={onEdit}>
            Edit
          </Button>
          {item.category === 'abandoned' ? null : (
            <Button
              variant="quiet"
              size="small"
              sx={ACTION_SX}
              disabled={archive.isPending}
              onClick={() => archive.mutate(item.id)}
            >
              Archive
            </Button>
          )}
          <PinButton
            pinned={item.pinned}
            name={item.name}
            disabled={update.isPending}
            onToggle={() => update.mutate({ itemId: item.id, patch: { pinned: !item.pinned } })}
          />
        </Box>
      </RuledRow>

      {open ? (
        <RuledRow columns="28px minmax(0, 1fr)" sx={{ py: 3 }}>
          <span />
          {open === 'use' ? (
            <NoteForm
              key="use"
              optional
              placeholder="what for / when..."
              submitLabel="Log"
              isPending={logUse.isPending}
              error={logUse.error}
              onSubmit={(text) => logUse.mutateAsync({ itemId: item.id, text })}
              onCancel={() => setOpen(null)}
            />
          ) : (
            <NoteForm
              key="note"
              placeholder="note (what for / when)..."
              submitLabel="Add"
              isPending={addNote.isPending}
              error={addNote.error}
              onSubmit={(text) => addNote.mutateAsync({ itemId: item.id, text })}
              onCancel={() => setOpen(null)}
            />
          )}
        </RuledRow>
      ) : null}
    </>
  )
}
