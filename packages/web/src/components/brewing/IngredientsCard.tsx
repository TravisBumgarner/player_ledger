import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { createIngredientSchema, type Ingredient, type Rarity } from '@player-ledger/shared'
import { type FormEvent, useState } from 'react'
import { RaritySelect } from '@/components/brewing/RecipesCard'
import Badge from '@/components/ledger/Badge'
import EmptyState from '@/components/ledger/EmptyState'
import { AnimatePresence, MotionRow } from '@/components/ledger/motion'
import RuledRow from '@/components/ledger/RuledRow'
import Section from '@/components/ledger/Section'
import {
  useCreateIngredient,
  useDeleteIngredient,
  useUpdateIngredient,
} from '@/hooks/mutations/useBrewingMutations'
import { errorMessage } from '@/lib/errorMessages'

export type IngredientsCardProps = { characterId: string; ingredients: Ingredient[] }

export default function IngredientsCard({ characterId, ingredients }: IngredientsCardProps) {
  const [adding, setAdding] = useState(false)
  const update = useUpdateIngredient(characterId)
  const remove = useDeleteIngredient(characterId)
  const error = update.error ?? remove.error

  const setQty = (ingredient: Ingredient, qty: number) =>
    update.mutate({ id: ingredient.id, input: { qty: Math.max(0, qty) } })

  return (
    <Section
      title="Ingredient stock"
      right={
        <Button variant="text" onClick={() => setAdding(!adding)} aria-expanded={adding}>
          {adding ? 'Cancel' : '+ Add ingredient'}
        </Button>
      }
    >
      {adding ? (
        <AddIngredientForm characterId={characterId} onDone={() => setAdding(false)} />
      ) : null}

      {ingredients.length === 0 ? (
        <EmptyState>No ingredients in stock.</EmptyState>
      ) : (
        <AnimatePresence initial={false}>
          {ingredients.map((ingredient) => (
            <MotionRow key={ingredient.id}>
              <RuledRow key={ingredient.id} columns="minmax(0, 1fr) auto 120px 72px">
                <Typography variant="body1">{ingredient.name}</Typography>
                <Typography variant="capsXs">{ingredient.rarity}</Typography>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}
                >
                  <Button
                    size="small"
                    aria-label={`One fewer ${ingredient.name}`}
                    disabled={ingredient.qty <= 0}
                    onClick={() => setQty(ingredient, ingredient.qty - 1)}
                  >
                    −
                  </Button>
                  <Badge>{ingredient.qty}</Badge>
                  <Button
                    size="small"
                    aria-label={`One more ${ingredient.name}`}
                    onClick={() => setQty(ingredient, ingredient.qty + 1)}
                  >
                    +
                  </Button>
                </Box>
                <Box data-row-actions>
                  <Button
                    variant="quiet"
                    onClick={() => remove.mutate(ingredient.id)}
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'grid', gap: 2, py: 4, borderBottom: 1, borderColor: 'ledger.line' }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
        <Button type="submit" disabled={!parsed.success || create.isPending}>
          Add
        </Button>
      </Box>
      {create.isError ? <Alert severity="error">{errorMessage(create.error)}</Alert> : null}
    </Box>
  )
}
