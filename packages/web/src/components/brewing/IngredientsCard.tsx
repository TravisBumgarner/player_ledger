import { createIngredientSchema, type Ingredient, type Rarity } from '@awesomeness-mgmt/shared'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import CardHeader from '@/components/brewing/CardHeader'
import { RaritySelect } from '@/components/brewing/RecipesCard'
import {
  useCreateIngredient,
  useDeleteIngredient,
  useUpdateIngredient,
} from '@/hooks/mutations/useBrewingMutations'
import { errorMessage } from '@/lib/errorMessages'
import NoData from '@/sharedComponents/NoData'
import TextAction from '@/sharedComponents/TextAction'

export type IngredientsCardProps = { characterId: string; ingredients: Ingredient[] }

export default function IngredientsCard({ characterId, ingredients }: IngredientsCardProps) {
  const [adding, setAdding] = useState(false)
  const update = useUpdateIngredient(characterId)
  const remove = useDeleteIngredient(characterId)
  const error = update.error ?? remove.error

  const setQty = (ingredient: Ingredient, qty: number) =>
    update.mutate({ id: ingredient.id, input: { qty: Math.max(0, qty) } })

  return (
    <Paper variant="section" component="section" aria-label="Ingredient stock">
      <CardHeader title="Ingredient Stock">
        <TextAction onClick={() => setAdding(!adding)} aria-expanded={adding}>
          + add
        </TextAction>
      </CardHeader>

      {adding ? (
        <AddIngredientForm characterId={characterId} onDone={() => setAdding(false)} />
      ) : null}

      {ingredients.length === 0 ? (
        <NoData message="No ingredients in stock." />
      ) : (
        <Box>
          {ingredients.map((ingredient) => (
            <Paper
              key={ingredient.id}
              variant="row"
              sx={{ py: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Typography variant="h6" component="p" sx={{ flex: 1, minWidth: 0 }}>
                {ingredient.name}{' '}
                <Typography variant="caption" component="span">
                  ({ingredient.rarity})
                </Typography>
              </Typography>
              <TextAction onClick={() => remove.mutate(ingredient.id)} disabled={remove.isPending}>
                Remove
              </TextAction>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  aria-label={`One fewer ${ingredient.name}`}
                  disabled={ingredient.qty <= 0}
                  onClick={() => setQty(ingredient, ingredient.qty - 1)}
                  sx={{ width: 26, px: 0 }}
                >
                  −
                </Button>
                <Typography
                  variant="h6"
                  component="span"
                  sx={{ minWidth: 24, textAlign: 'center' }}
                >
                  {ingredient.qty}
                </Typography>
                <Button
                  size="small"
                  aria-label={`One more ${ingredient.name}`}
                  onClick={() => setQty(ingredient, ingredient.qty + 1)}
                  sx={{ width: 26, px: 0 }}
                >
                  +
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {error ? <Alert severity="error">{errorMessage(error)}</Alert> : null}
    </Paper>
  )
}

function AddIngredientForm({ characterId, onDone }: { characterId: string; onDone: () => void }) {
  const [name, setName] = useState('')
  const [rarity, setRarity] = useState<Rarity>('Common')
  const create = useCreateIngredient(characterId)

  const parsed = createIngredientSchema.safeParse({ name, rarity })

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
          placeholder="ingredient name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          slotProps={{ htmlInput: { 'aria-label': 'Ingredient name' } }}
          sx={{ flex: 1, minWidth: 120 }}
        />
        <RaritySelect value={rarity} onChange={setRarity} />
        <Button type="submit" size="small" disabled={!parsed.success || create.isPending}>
          Add
        </Button>
      </Box>
      {create.isError ? <Alert severity="error">{errorMessage(create.error)}</Alert> : null}
    </Box>
  )
}
