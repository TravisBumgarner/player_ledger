import ActiveBrewCard from '@/components/brewing/ActiveBrewCard'
import IngredientsCard from '@/components/brewing/IngredientsCard'
import LevelCard from '@/components/brewing/LevelCard'
import RecipesCard from '@/components/brewing/RecipesCard'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import NotesCard from '@/components/journal/NotesCard'
import Page from '@/components/ledger/Page'
import { useBrewingState, useIngredients, useRecipes } from '@/hooks/queries/useBrewing'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'

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
    <Page>
      <LevelCard characterId={character.id} state={state.data} />
      <ActiveBrewCard characterId={character.id} state={state.data} recipes={recipes.data} />
      <RecipesCard characterId={character.id} recipes={recipes.data} />
      <IngredientsCard characterId={character.id} ingredients={ingredients.data} />
      <NotesCard kind="brewing" title="Brewing notes" />
    </Page>
  )
}
