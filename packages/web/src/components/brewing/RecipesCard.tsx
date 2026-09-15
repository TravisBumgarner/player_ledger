import { createRecipeSchema, RARITIES, type Rarity, type Recipe } from '@awesomeness-mgmt/shared'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import CardHeader from '@/components/brewing/CardHeader'
import {
  useCreateRecipe,
  useDeleteRecipe,
  useUpdateRecipe,
} from '@/hooks/mutations/useBrewingMutations'
import { errorMessage } from '@/lib/errorMessages'
import NoData from '@/sharedComponents/NoData'
import TextAction from '@/sharedComponents/TextAction'

export type RecipesCardProps = { characterId: string; recipes: Recipe[] }

export default function RecipesCard({ characterId, recipes }: RecipesCardProps) {
  const [adding, setAdding] = useState(false)
  const update = useUpdateRecipe(characterId)
  const remove = useDeleteRecipe(characterId)
  const error = update.error ?? remove.error

  return (
    <Paper variant="section" component="section" aria-label="Recipes known">
      <CardHeader title="Recipes Known">
        <TextAction onClick={() => setAdding(!adding)} aria-expanded={adding}>
          + add
        </TextAction>
      </CardHeader>

      {adding ? <AddRecipeForm characterId={characterId} onDone={() => setAdding(false)} /> : null}

      {recipes.length === 0 ? (
        <NoData message="No recipes yet." />
      ) : (
        <Box>
          {recipes.map((recipe) => (
            <Paper key={recipe.id} variant="row" sx={{ py: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox
                  size="small"
                  checked={recipe.known}
                  onChange={(event) =>
                    update.mutate({ id: recipe.id, input: { known: event.target.checked } })
                  }
                  slotProps={{ input: { 'aria-label': `${recipe.name} is known` } }}
                  sx={{ p: 0.5, ml: -0.5 }}
                />
                <Typography variant="h6" component="p" sx={{ flex: 1, minWidth: 0 }}>
                  {recipe.name}
                </Typography>
                <Typography variant="caption" component="span">
                  {recipe.rarity}
                </Typography>
                <TextAction onClick={() => remove.mutate(recipe.id)} disabled={remove.isPending}>
                  Remove
                </TextAction>
              </Box>
              <Box sx={{ pl: 4, display: 'grid', gap: 0.25 }}>
                {recipe.ingredients ? (
                  <Typography variant="body2" component="p">
                    Ingredients: {recipe.ingredients}
                  </Typography>
                ) : null}
                {recipe.description ? (
                  <Typography variant="body2" component="p">
                    <em>{recipe.description}</em>
                  </Typography>
                ) : null}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {error ? <Alert severity="error">{errorMessage(error)}</Alert> : null}
    </Paper>
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
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 1 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
        <Button type="submit" size="small" disabled={!parsed.success || create.isPending}>
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
