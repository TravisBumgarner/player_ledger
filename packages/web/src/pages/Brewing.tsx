import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ActiveBrewCard from '@/components/brewing/ActiveBrewCard'
import IngredientsCard from '@/components/brewing/IngredientsCard'
import LevelCard from '@/components/brewing/LevelCard'
import RecipesCard from '@/components/brewing/RecipesCard'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import NotesCard from '@/components/journal/NotesCard'
import { useBrewingState, useIngredients, useRecipes } from '@/hooks/queries/useBrewing'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import SectionLabel from '@/sharedComponents/SectionLabel'

export default function Brewing() {
  const { character } = useActiveCharacter()
  const state = useBrewingState(character.id)
  const recipes = useRecipes(character.id)
  const ingredients = useIngredients(character.id)

  const failed = [state, recipes, ingredients].find((query) => query.isError)
  if (failed) {
    return (
      <LoadFailure
        error={failed.error}
        fallback="Could not load potion brewing."
        onRetry={() => {
          void state.refetch()
          void recipes.refetch()
          void ingredients.refetch()
        }}
      />
    )
  }

  if (!state.data || !recipes.data || !ingredients.data) return <Loading label="Loading brewing" />

  return (
    <Box sx={{ display: 'grid', gap: 2.5 }}>
      <Typography variant="body1" component="p">
        Homebrew addition — tracks recipes, ingredients, and progress. Kept separate from the main
        sheet.
      </Typography>

      <LevelCard characterId={character.id} state={state.data} />
      <ActiveBrewCard characterId={character.id} state={state.data} recipes={recipes.data} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 2,
          alignItems: 'start',
        }}
      >
        <RecipesCard characterId={character.id} recipes={recipes.data} />
        <IngredientsCard characterId={character.id} ingredients={ingredients.data} />
      </Box>

      <Box component="section" sx={{ display: 'grid', gap: '10px' }}>
        <SectionLabel>Notes</SectionLabel>
        <NotesCard kind="brewing" />
      </Box>
    </Box>
  )
}
