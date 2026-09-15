import {
  type CreateItem,
  createItemSchema,
  type InventoryItem,
  ITEM_CATEGORIES,
  ITEM_CATEGORY_LABELS,
  type ItemType,
  type ResetOn,
} from '@awesomeness-mgmt/shared'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import {
  useCreateItem,
  useDeleteItem,
  useUpdateItem,
} from '@/hooks/mutations/useInventoryMutations'
import { errorMessage } from '@/lib/errorMessages'

/** The number field stays a string while typed, so clearing it to retype is allowed. */
type Draft = Required<Omit<CreateItem, 'total'>> & { total: string }

function draftFor(item: InventoryItem | null): Draft {
  if (!item) {
    return {
      type: 'gear',
      name: '',
      category: 'items',
      total: '1',
      resetOn: 'none',
      qtyTag: '',
      trackedDndBeyond: false,
    }
  }
  return {
    type: item.type,
    name: item.name,
    category: item.category,
    total: String(item.total || 1),
    resetOn: item.resetOn,
    qtyTag: item.qtyTag,
    trackedDndBeyond: item.trackedDndBeyond,
  }
}

const toNumber = (value: string) => (value.trim() === '' ? Number.NaN : Number(value))

export type ItemFormDialogProps = {
  open: boolean
  /** Null adds a new item. */
  item: InventoryItem | null
  onClose: () => void
}

export default function ItemFormDialog({ open, item, onClose }: ItemFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <ItemForm key={item?.id ?? 'new'} item={item} onClose={onClose} />
    </Dialog>
  )
}

function ItemForm({ item, onClose }: { item: InventoryItem | null; onClose: () => void }) {
  const { character } = useActiveCharacter()
  const create = useCreateItem(character.id)
  const update = useUpdateItem(character.id)
  const remove = useDeleteItem(character.id)
  const [draft, setDraft] = useState(() => draftFor(item))

  const patch = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }))

  const consumable = draft.type === 'consumable'
  const total = toNumber(draft.total)
  const parsed = createItemSchema.safeParse({ ...draft, total: consumable ? total : 0 })
  const totalInvalid = consumable && !(Number.isInteger(total) && total >= 1)
  const issues = new Set(parsed.success ? [] : parsed.error.issues.map((issue) => issue.path[0]))
  const busy = create.isPending || update.isPending || remove.isPending
  const failure = create.error ?? update.error ?? remove.error

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success || totalInvalid) return
    const done = { onSuccess: onClose }
    const fields = parsed.data

    if (!item) return create.mutate(parsed.data, done)
    const changes = consumable
      ? {
          name: fields.name,
          category: fields.category,
          total: fields.total,
          resetOn: fields.resetOn,
        }
      : {
          name: fields.name,
          category: fields.category,
          qtyTag: fields.qtyTag,
          trackedDndBeyond: fields.trackedDndBeyond,
        }
    update.mutate({ itemId: item.id, patch: changes }, done)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogTitle>{item ? 'Edit Item' : 'Add Item'}</DialogTitle>

      <DialogContent sx={{ display: 'grid', gap: '14px' }}>
        {/* Type is fixed once an item exists, by design. */}
        {item ? null : (
          <Box sx={{ display: 'grid', gap: '6px' }}>
            <Typography variant="overline" component="p" id="item-type">
              Type
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              aria-labelledby="item-type"
              value={draft.type}
              onChange={(_event, value: ItemType | null) => {
                if (value) patch({ type: value })
              }}
            >
              <ToggleButton value="gear">Gear</ToggleButton>
              <ToggleButton value="consumable">Consumable</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <TextField
          label="Name"
          size="small"
          required
          autoFocus
          value={draft.name}
          onChange={(event) => patch({ name: event.target.value })}
          error={draft.name.trim() !== '' && issues.has('name')}
          helperText={
            draft.name.trim() !== '' && issues.has('name')
              ? 'Keep it under 120 characters.'
              : undefined
          }
        />

        <TextField
          select
          label="Category"
          size="small"
          value={draft.category}
          onChange={(event) => patch({ category: event.target.value as Draft['category'] })}
        >
          {ITEM_CATEGORIES.map((category) => (
            <MenuItem key={category} value={category}>
              {ITEM_CATEGORY_LABELS[category]}
            </MenuItem>
          ))}
        </TextField>

        {consumable ? (
          <>
            <TextField
              label="Total quantity"
              size="small"
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
              value={draft.total}
              onChange={(event) => patch({ total: event.target.value })}
              error={totalInvalid}
              helperText={totalInvalid ? 'A whole number, 1 or more' : undefined}
            />

            <Box sx={{ display: 'grid', gap: '6px' }}>
              <Typography variant="overline" component="p" id="item-reset-on">
                Resets on
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                aria-labelledby="item-reset-on"
                value={draft.resetOn}
                onChange={(_event, value: ResetOn | null) => {
                  if (value) patch({ resetOn: value })
                }}
              >
                <ToggleButton value="none">Never</ToggleButton>
                <ToggleButton value="short">Short Rest</ToggleButton>
                <ToggleButton value="long">Long Rest</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </>
        ) : (
          <>
            <TextField
              label="Tag / effect (optional)"
              size="small"
              placeholder="e.g. +1 AC, gift from the Tritons"
              value={draft.qtyTag}
              onChange={(event) => patch({ qtyTag: event.target.value })}
              error={issues.has('qtyTag')}
              helperText={issues.has('qtyTag') ? 'Keep it under 120 characters.' : undefined}
            />
            <FormControlLabel
              label="Already tracked on D&D Beyond (this is just a mirror/note)"
              control={
                <Checkbox
                  size="small"
                  checked={draft.trackedDndBeyond}
                  onChange={(event) => patch({ trackedDndBeyond: event.target.checked })}
                />
              }
            />
          </>
        )}

        {failure ? <Alert severity="error">{errorMessage(failure)}</Alert> : null}
      </DialogContent>

      <DialogActions>
        {item ? (
          <Button
            variant="text"
            color="error"
            size="small"
            disabled={busy}
            onClick={() => remove.mutate(item.id, { onSuccess: onClose })}
            sx={{ mr: 'auto' }}
          >
            Delete
          </Button>
        ) : null}
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!parsed.success || totalInvalid || busy}
        >
          Save
        </Button>
      </DialogActions>
    </Box>
  )
}
