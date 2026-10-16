import { type InventoryItem, ITEM_CATEGORIES } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import ItemCategoryTable from '@/components/inventory/ItemCategoryTable'
import ItemFormDialog from '@/components/inventory/ItemFormDialog'
import Page from '@/components/ledger/Page'
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
    <Page>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="text" onClick={() => setDialog({ open: true, item: null })}>
          + Add item
        </Button>
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
    </Page>
  )
}
