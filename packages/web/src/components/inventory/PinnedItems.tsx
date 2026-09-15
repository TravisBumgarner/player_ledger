import type { InventoryItem } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useLogItemUse, useUpdateItem } from '@/hooks/mutations/useInventoryMutations'
import { useInventory } from '@/hooks/queries/useInventory'
import PinButton from '@/sharedComponents/PinButton'
import SectionLabel from '@/sharedComponents/SectionLabel'
import ItemName from './ItemName'
import { latestNote } from './itemText'
import NoteForm from './NoteForm'

/** Overview's "Inventory" group: one card per pinned item, or nothing at all. */
export default function PinnedItems() {
  const { character } = useActiveCharacter()
  const inventory = useInventory(character.id)
  const pinned = inventory.data?.filter((item) => item.pinned) ?? []

  if (pinned.length === 0) return null

  return (
    <Box component="section" sx={{ display: 'grid', gap: '10px' }}>
      <SectionLabel>Inventory</SectionLabel>
      {pinned.map((item) =>
        item.type === 'consumable' ? (
          <ConsumableCard key={item.id} item={item} />
        ) : (
          <GearCard key={item.id} item={item} />
        ),
      )}
    </Box>
  )
}

const CARD_SX = { p: '14px 18px', display: 'grid', gap: '8px' }
const HEADER_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  columnGap: '12px',
  rowGap: '4px',
}

function ConsumableCard({ item }: { item: InventoryItem }) {
  const { character } = useActiveCharacter()
  const update = useUpdateItem(character.id)
  const logUse = useLogItemUse(character.id)
  const [using, setUsing] = useState(false)
  const note = latestNote(item)

  return (
    <Paper variant="card" component="article" sx={CARD_SX}>
      <Box sx={HEADER_SX}>
        <ItemName item={item} variant="h5" />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography variant="body1" color="text.secondary">
            {item.remaining} / {item.total}
          </Typography>
          <PinButton
            pinned={item.pinned}
            name={item.name}
            disabled={update.isPending}
            onToggle={() => update.mutate({ itemId: item.id, patch: { pinned: false } })}
          />
        </Box>
      </Box>

      <Box>
        <Button
          size="small"
          aria-expanded={using}
          disabled={item.remaining <= 0}
          onClick={() => {
            logUse.reset()
            setUsing((current) => !current)
          }}
        >
          Log a use
        </Button>
      </Box>

      {note ? (
        <Typography variant="body2" color="text.secondary">
          {note.text}
          {note.more > 0 ? (
            <Typography
              variant="meta"
              component="span"
              sx={{ whiteSpace: 'nowrap' }}
            >{`  (+${note.more} more)`}</Typography>
          ) : null}
        </Typography>
      ) : null}

      {using ? (
        <NoteForm
          optional
          placeholder="what for / when..."
          submitLabel="Log"
          isPending={logUse.isPending}
          error={logUse.error}
          onSubmit={(text) => logUse.mutateAsync({ itemId: item.id, text })}
          onCancel={() => setUsing(false)}
        />
      ) : null}
    </Paper>
  )
}

function GearCard({ item }: { item: InventoryItem }) {
  const { character } = useActiveCharacter()
  const update = useUpdateItem(character.id)

  return (
    <Paper variant="card" component="article" sx={CARD_SX}>
      <Box sx={HEADER_SX}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
          <Checkbox
            size="small"
            checked={item.used}
            disabled={update.isPending}
            onChange={(event) =>
              update.mutate({ itemId: item.id, patch: { used: event.target.checked } })
            }
            slotProps={{ input: { 'aria-label': `${item.name} used` } }}
            sx={{ m: '-9px 0 -9px -9px' }}
          />
          <ItemName item={item} variant="h5" />
        </Box>
        <PinButton
          pinned={item.pinned}
          name={item.name}
          disabled={update.isPending}
          onToggle={() => update.mutate({ itemId: item.id, patch: { pinned: false } })}
        />
      </Box>

      {item.qtyTag ? (
        <Typography variant="body1" color="text.secondary">
          {item.qtyTag}
        </Typography>
      ) : null}
    </Paper>
  )
}
