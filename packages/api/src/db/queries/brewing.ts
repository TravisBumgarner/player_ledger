import {
  BREW_HOURS_BY_RARITY,
  BREW_SESSION_HOURS,
  type BrewingState,
  type CreateIngredient,
  type CreateRecipe,
  type Ingredient,
  type Recipe,
  type UpdateBrewingLevel,
  type UpdateIngredient,
  type UpdateRecipe,
} from '@player-ledger/shared'
import { and, asc, eq, isNotNull, sql } from 'drizzle-orm'
import { db } from '../index.js'
import {
  type BrewingStateRow,
  brewingStates,
  type IngredientRow,
  ingredients,
  type RecipeRow,
  recipes,
} from '../schema.js'

const EXP_CAP = 100_000

export function toBrewingState(row: BrewingStateRow): BrewingState {
  return {
    level: row.level,
    exp: row.exp,
    expAtLevel: row.expAtLevel,
    expToNext: row.expToNext,
    activeBrew:
      row.brewName !== null && row.brewRarity !== null
        ? {
            name: row.brewName,
            rarity: row.brewRarity,
            hoursLogged: row.brewHoursLogged,
            hoursTotal: row.brewHoursTotal,
            gold: row.brewGold,
          }
        : null,
  }
}

export function toRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    characterId: row.characterId,
    name: row.name,
    rarity: row.rarity,
    known: row.known,
    ingredients: row.ingredients,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  }
}

export function toIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    characterId: row.characterId,
    name: row.name,
    rarity: row.rarity,
    qty: row.qty,
    createdAt: row.createdAt.toISOString(),
  }
}

/** Two first reads racing both insert; the loser's insert is a no-op rather than a failure. */
async function ensureBrewingState(characterId: string): Promise<void> {
  await db.insert(brewingStates).values({ characterId }).onConflictDoNothing()
}

export async function getBrewingState(characterId: string): Promise<BrewingStateRow> {
  await ensureBrewingState(characterId)
  const [row] = await db
    .select()
    .from(brewingStates)
    .where(eq(brewingStates.characterId, characterId))
  return row
}

export async function updateBrewingLevel(
  characterId: string,
  input: UpdateBrewingLevel,
): Promise<BrewingStateRow> {
  await ensureBrewingState(characterId)
  if (Object.keys(input).length === 0) return getBrewingState(characterId)

  const [row] = await db
    .update(brewingStates)
    .set(input)
    .where(eq(brewingStates.characterId, characterId))
    .returning()
  return row
}

export async function logExp(characterId: string, amount: number): Promise<BrewingStateRow> {
  await ensureBrewingState(characterId)
  const [row] = await db
    .update(brewingStates)
    // Capped at the most the level editor accepts, so a logged total can always be saved back.
    .set({ exp: sql`min(${EXP_CAP}, ${brewingStates.exp} + ${amount})` })
    .where(eq(brewingStates.characterId, characterId))
    .returning()
  return row
}

/** Replaces whatever was brewing. */
export async function startBrew(
  characterId: string,
  recipe: RecipeRow,
  gold: number,
): Promise<BrewingStateRow> {
  await ensureBrewingState(characterId)
  const [row] = await db
    .update(brewingStates)
    .set({
      brewName: recipe.name,
      brewRarity: recipe.rarity,
      brewHoursLogged: 0,
      brewHoursTotal: BREW_HOURS_BY_RARITY[recipe.rarity],
      brewGold: gold,
    })
    .where(eq(brewingStates.characterId, characterId))
    .returning()
  return row
}

/** Undefined when nothing is brewing. */
export async function logBrewSession(characterId: string): Promise<BrewingStateRow | undefined> {
  const [row] = await db
    .update(brewingStates)
    .set({
      brewHoursLogged: sql`min(${brewingStates.brewHoursTotal}, ${brewingStates.brewHoursLogged} + ${BREW_SESSION_HOURS})`,
    })
    .where(and(eq(brewingStates.characterId, characterId), isNotNull(brewingStates.brewName)))
    .returning()
  return row
}

export async function clearBrew(characterId: string): Promise<BrewingStateRow> {
  await ensureBrewingState(characterId)
  const [row] = await db
    .update(brewingStates)
    .set({ brewName: null, brewRarity: null, brewHoursLogged: 0, brewHoursTotal: 0, brewGold: 0 })
    .where(eq(brewingStates.characterId, characterId))
    .returning()
  return row
}

const ownedRecipe = (characterId: string, recipeId: string) =>
  and(eq(recipes.characterId, characterId), eq(recipes.id, recipeId))

export async function listRecipes(characterId: string): Promise<RecipeRow[]> {
  return db
    .select()
    .from(recipes)
    .where(eq(recipes.characterId, characterId))
    .orderBy(asc(recipes.createdAt))
}

export async function findRecipe(
  characterId: string,
  recipeId: string,
): Promise<RecipeRow | undefined> {
  const [row] = await db.select().from(recipes).where(ownedRecipe(characterId, recipeId))
  return row
}

export async function createRecipe(characterId: string, input: CreateRecipe): Promise<RecipeRow> {
  const [row] = await db
    .insert(recipes)
    .values({ characterId, ...input, known: true })
    .returning()
  return row
}

export async function updateRecipe(
  characterId: string,
  recipeId: string,
  input: UpdateRecipe,
): Promise<RecipeRow | undefined> {
  if (Object.keys(input).length === 0) return findRecipe(characterId, recipeId)

  const [row] = await db
    .update(recipes)
    .set(input)
    .where(ownedRecipe(characterId, recipeId))
    .returning()
  return row
}

export async function deleteRecipe(characterId: string, recipeId: string): Promise<boolean> {
  const rows = await db
    .delete(recipes)
    .where(ownedRecipe(characterId, recipeId))
    .returning({ id: recipes.id })
  return rows.length > 0
}

const ownedIngredient = (characterId: string, ingredientId: string) =>
  and(eq(ingredients.characterId, characterId), eq(ingredients.id, ingredientId))

export async function listIngredients(characterId: string): Promise<IngredientRow[]> {
  return db
    .select()
    .from(ingredients)
    .where(eq(ingredients.characterId, characterId))
    .orderBy(asc(ingredients.createdAt))
}

export async function createIngredient(
  characterId: string,
  input: CreateIngredient,
): Promise<IngredientRow> {
  const [row] = await db
    .insert(ingredients)
    .values({ characterId, ...input })
    .returning()
  return row
}

export async function updateIngredient(
  characterId: string,
  ingredientId: string,
  input: UpdateIngredient,
): Promise<IngredientRow | undefined> {
  if (Object.keys(input).length === 0) {
    const [row] = await db
      .select()
      .from(ingredients)
      .where(ownedIngredient(characterId, ingredientId))
    return row
  }

  const [row] = await db
    .update(ingredients)
    .set(input)
    .where(ownedIngredient(characterId, ingredientId))
    .returning()
  return row
}

export async function deleteIngredient(
  characterId: string,
  ingredientId: string,
): Promise<boolean> {
  const rows = await db
    .delete(ingredients)
    .where(ownedIngredient(characterId, ingredientId))
    .returning({ id: ingredients.id })
  return rows.length > 0
}
