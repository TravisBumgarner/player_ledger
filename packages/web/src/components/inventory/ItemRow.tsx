import type { InventoryItem } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import {
  useAddItemNote,
  useArchiveItem,
  useLogItemUse,
  useUpdateItem,
} from '@/hooks/mutations/useInventoryMutations'
import PinButton from '@/sharedComponents/PinButton'
import TextAction from '@/sharedComponents/TextAction'
import ItemName from './ItemName'
import { latestNote, resetLabel } from './itemText'
import NoteForm from './NoteForm'

export const ITEM_COLUMNS = 5

export type ItemRowProps = {
  item: InventoryItem
  onEdit: () => void
}

export default function ItemRow({ item, onEdit }: ItemRowProps) {
  const { character } = useActiveCharacter()
  const update = useUpdateItem(character.id)
  const archive = useArchiveItem(character.id)
  const addNote = useAddItemNote(character.id)
  const logUse = useLogItemUse(character.id)
  const [open, setOpen] = useState<'use' | 'note' | null>(null)

  const consumable = item.type === 'consumable'
  const note = latestNote(item)

  function toggle(form: 'use' | 'note') {
    addNote.reset()
    logUse.reset()
    setOpen((current) => (current === form ? null : form))
  }

  return (
    <>
      <TableRow>
        <TableCell padding="checkbox">
          {consumable ? null : (
            <Checkbox
              size="small"
              checked={item.used}
              disabled={update.isPending}
              onChange={(event) =>
                update.mutate({ itemId: item.id, patch: { used: event.target.checked } })
              }
              slotProps={{ input: { 'aria-label': `${item.name} used` } }}
            />
          )}
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <ItemName item={item} />
            {item.trackedDndBeyond ? <Chip label="D&D Beyond" /> : null}
          </Box>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {consumable ? (
            <>
              <Typography variant="body1" component="div">
                {item.remaining} / {item.total}
              </Typography>
              <Typography variant="caption" component="div">
                {resetLabel(item.resetOn)}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {item.qtyTag}
            </Typography>
          )}
        </TableCell>

        <TableCell sx={{ minWidth: 160, maxWidth: 280 }}>
          <Typography variant="body2" color="text.secondary">
            {note ? note.text : '—'}
            {note && note.more > 0 ? (
              <Typography variant="meta" component="span" sx={{ whiteSpace: 'nowrap' }}>
                {`  (+${note.more} more)`}
              </Typography>
            ) : null}
          </Typography>
        </TableCell>

        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}
          >
            {consumable ? (
              <Button
                size="small"
                aria-expanded={open === 'use'}
                disabled={item.remaining <= 0}
                onClick={() => toggle('use')}
              >
                Log use
              </Button>
            ) : null}
            <TextAction aria-expanded={open === 'note'} onClick={() => toggle('note')}>
              + note
            </TextAction>
            <TextAction onClick={onEdit}>Edit</TextAction>
            {item.category === 'abandoned' ? null : (
              <TextAction disabled={archive.isPending} onClick={() => archive.mutate(item.id)}>
                Archive
              </TextAction>
            )}
            <PinButton
              pinned={item.pinned}
              name={item.name}
              disabled={update.isPending}
              onToggle={() => update.mutate({ itemId: item.id, patch: { pinned: !item.pinned } })}
            />
          </Box>
        </TableCell>
      </TableRow>

      {open ? (
        <TableRow>
          <TableCell colSpan={ITEM_COLUMNS}>
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
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}
