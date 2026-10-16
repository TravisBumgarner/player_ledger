import type { InventoryItem, ItemCategory } from '@awesomeness-mgmt/shared'
import DataTable from '@/components/ledger/DataTable'
import { MotionRow } from '@/components/ledger/motion'
import Section from '@/components/ledger/Section'
import ItemRow, { ITEM_COLUMNS } from './ItemRow'

const TITLES: Record<ItemCategory, string> = {
  consumables: 'Consumables',
  items: 'Items',
  abandoned: 'Abandoned · Lost · Used',
}

export type ItemCategoryTableProps = {
  category: ItemCategory
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
}

export default function ItemCategoryTable({ category, items, onEdit }: ItemCategoryTableProps) {
  return (
    <Section title={TITLES[category]}>
      <DataTable
        columns={ITEM_COLUMNS}
        headers={['', 'Name', 'Qty', 'Notes', '']}
        empty="Nothing here."
      >
        {items.map((item) => (
          <MotionRow key={item.id}>
            <ItemRow
              key={item.id}
              item={item}
              dimmed={category === 'abandoned'}
              onEdit={() => onEdit(item)}
            />
          </MotionRow>
        ))}
      </DataTable>
    </Section>
  )
}
