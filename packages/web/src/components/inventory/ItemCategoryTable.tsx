import {
  type InventoryItem,
  ITEM_CATEGORY_LABELS,
  type ItemCategory,
} from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import SectionLabel from '@/sharedComponents/SectionLabel'
import ItemRow, { ITEM_COLUMNS } from './ItemRow'

const COLUMN_WIDTHS = [48, '22%', '14%', 'auto', 252]

export type ItemCategoryTableProps = {
  category: ItemCategory
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
}

export default function ItemCategoryTable({ category, items, onEdit }: ItemCategoryTableProps) {
  return (
    <Box component="section" sx={{ display: 'grid', gap: '4px' }}>
      <SectionLabel>{ITEM_CATEGORY_LABELS[category]}</SectionLabel>

      {/* Scrolls inside itself so a narrow window never scrolls the page sideways. */}
      <TableContainer>
        <Table size="small" sx={{ minWidth: 760, tableLayout: 'fixed' }}>
          {/* Fixed widths, so the three tables line their columns up with each other. */}
          <colgroup>
            {COLUMN_WIDTHS.map((width) => (
              <Box key={width} component="col" sx={{ width }} />
            ))}
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Name</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={ITEM_COLUMNS}>
                  <Typography variant="body2" data-empty="true">
                    Nothing here.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => <ItemRow key={item.id} item={item} onEdit={() => onEdit(item)} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
