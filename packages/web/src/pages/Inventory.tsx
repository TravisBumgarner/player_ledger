import { type InventoryItem, ITEM_CATEGORIES } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import ItemCategoryTable from '@/components/inventory/ItemCategoryTable'
import ItemFormDialog from '@/components/inventory/ItemFormDialog'
import { useInventory } from '@/hooks/queries/useInventory'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'

/** The item outlives `open`, so a closing edit form does not flash into the add form. */
type DialogState = { open: boolean; item: InventoryItem | null }

export default function Inventory() {
  const { character } = useActiveCharacter()
  const inventory = useInventory(character.id)
  const [dialog, setDialog] = useState<DialogState>({ open: false, item: null })

  return (
    <Box sx={{ display: 'grid', gap: '20px' }}>
      <Box sx={{ display: 'grid', gap: '4px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={() => setDialog({ open: true, item: null })}>
            + Add Item
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Gear and consumables not tracked elsewhere — pick a type when adding to get the right
          fields.
        </Typography>
      </Box>

      {inventory.isPending ? (
        <Loading label="Loading inventory" />
      ) : inventory.isError ? (
        <LoadFailure
          error={inventory.error}
          fallback="Could not load the inventory."
          onRetry={() => void inventory.refetch()}
        />
      ) : (
        ITEM_CATEGORIES.map((category) => (
          <ItemCategoryTable
            key={category}
            category={category}
            items={inventory.data.filter((item) => item.category === category)}
            onEdit={(item) => setDialog({ open: true, item })}
          />
        ))
      )}

      <ItemFormDialog
        open={dialog.open}
        item={dialog.item}
        onClose={() => setDialog((current) => ({ ...current, open: false }))}
      />
    </Box>
  )
}
