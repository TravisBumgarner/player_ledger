import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import PinnedItems from '@/components/inventory/PinnedItems'
import GoalsCard from '@/components/overview/GoalsCard'
import NothingPinned from '@/components/overview/NothingPinned'
import PinnedSpells from '@/components/spells/PinnedSpells'

export default function Overview() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Typography variant="body1" color="text.secondary">
        Your goals, plus anything pinned from Spells and Inventory — tap the star anywhere to pin or
        unpin.
      </Typography>
      <GoalsCard />
      <NothingPinned />
      <PinnedSpells />
      <PinnedItems />
    </Box>
  )
}
