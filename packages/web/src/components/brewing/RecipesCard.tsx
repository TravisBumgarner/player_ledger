import { createRecipeSchema, RARITIES, type Rarity, type Recipe } from '@awesomeness-mgmt/shared'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import EmptyState from '@/components/ledger/EmptyState'
import { AnimatePresence, MotionRow } from '@/components/ledger/motion'
import RuledRow from '@/components/ledger/RuledRow'
import Section from '@/components/ledger/Section'
import {
  useCreateRecipe,
  useDeleteRecipe,
  useUpdateRecipe,
} from '@/hooks/mutations/useBrewingMutations'
import { errorMessage } from '@/lib/errorMessages'

export type RecipesCardProps = { characterId: string; recipes: Recipe[] }

export default function RecipesCard({ characterId, recipes }: RecipesCardProps) {
  const [adding, setAdding] = useState(false)
  const update = useUpdateRecipe(characterId)
  const remove = useDeleteRecipe(characterId)
  const error = update.error ?? remove.error

  return (
    <Section
      title="Recipes known"
      right={
        <Button variant="text" onClick={() => setAdding(!adding)} aria-expanded={adding}>
          {adding ? 'Cancel' : '+ Add recipe'}
        </Button>
      }
    >
      {adding ? <AddRecipeForm characterId={characterId} onDone={() => setAdding(false)} /> : null}

      {recipes.length === 0 ? (
        <EmptyState>No recipes yet.</EmptyState>
      ) : (
        <AnimatePresence initial={false}>
          {recipes.map((recipe) => (
            <MotionRow key={recipe.id}>
              <RuledRow key={recipe.id} columns="28px minmax(0, 1fr) auto 72px" sx={{ py: 2 }}>
                <Checkbox
                  checked={recipe.known}
                  onChange={(event) =>
                    update.mutate({ id: recipe.id, input: { known: event.target.checked } })
                  }
                  slotProps={{ input: { 'aria-label': `${recipe.name} is known` } }}
                  sx={{ p: 0 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body1">{recipe.name}</Typography>
                  {recipe.ingredients ? (
                    <Typography variant="caption" component="p">
                      Ingredients: {recipe.ingredients}
                    </Typography>
                  ) : null}
                  {recipe.description ? (
                    <Typography variant="bodySm" sx={{ fontStyle: 'italic' }}>
                      {recipe.description}
                    </Typography>
                  ) : null}
                </Box>
                <Typography variant="capsXs">{recipe.rarity}</Typography>
                <Box data-row-actions>
                  <Button
                    variant="quiet"
                    onClick={() => remove.mutate(recipe.id)}
                    disabled={remove.isPending}
                  >
                    Remove
                  </Button>
                </Box>
              </RuledRow>
            </MotionRow>
          ))}
        </AnimatePresence>
      )}

      {error ? <Alert severity="error">{errorMessage(error)}</Alert> : null}
    </Section>
  )
}

function AddRecipeForm({ characterId, onDone }: { characterId: string; onDone: () => void }) {
  const [name, setName] = useState('')
  const [rarity, setRarity] = useState<Rarity>('Common')
  const [ingredients, setIngredients] = useState('')
  const [description, setDescription] = useState('')
  const create = useCreateRecipe(characterId)

  const parsed = createRecipeSchema.safeParse({
    name,
    rarity,
    ingredients,
    description: description.trim(),
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) return
    create.mutate(parsed.data, { onSuccess: onDone })
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'grid', gap: 2, py: 4, borderBottom: 1, borderColor: 'ledger.line' }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          placeholder="recipe name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          slotProps={{ htmlInput: { 'aria-label': 'Recipe name' } }}
          sx={{ flex: 1, minWidth: 120 }}
        />
        <RaritySelect value={rarity} onChange={setRarity} />
      </Box>
      <TextField
        size="small"
        placeholder="ingredients (comma separated)"
        value={ingredients}
        onChange={(event) => setIngredients(event.target.value)}
        slotProps={{ htmlInput: { 'aria-label': 'Ingredients' } }}
      />
      <TextField
        size="small"
        placeholder="what it does..."
        multiline
        minRows={2}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        slotProps={{ htmlInput: { 'aria-label': 'Description' } }}
      />
      {create.isError ? <Alert severity="error">{errorMessage(create.error)}</Alert> : null}
      <Box>
        <Button type="submit" disabled={!parsed.success || create.isPending}>
          Add
        </Button>
      </Box>
    </Box>
  )
}

export function RaritySelect({
  value,
  onChange,
}: {
  value: Rarity
  onChange: (rarity: Rarity) => void
}) {
  return (
    <TextField
      select
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value as Rarity)}
      slotProps={{ htmlInput: { 'aria-label': 'Rarity' } }}
      sx={{ width: 130 }}
    >
      {RARITIES.map((rarity) => (
        <MenuItem key={rarity} value={rarity}>
          {rarity}
        </MenuItem>
      ))}
    </TextField>
  )
}
