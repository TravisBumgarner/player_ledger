import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import PinnedItems from '@/components/inventory/PinnedItems'
import DevelopmentCard from '@/components/overview/DevelopmentCard'
import GoalsCard from '@/components/overview/GoalsCard'
import NothingPinned from '@/components/overview/NothingPinned'
import PinnedSpells from '@/components/spells/PinnedSpells'

export default function Overview() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Typography variant="body1" color="text.secondary">
        Your goals and how your character is developing, plus anything pinned from Spells and
        Inventory — tap the star anywhere to pin or unpin.
      </Typography>
      <GoalsCard />
      <DevelopmentCard />
      <NothingPinned />
      <PinnedSpells />
      <PinnedItems />
    </Box>
  )
}
