import { z } from 'zod'
import { count, longText, nameField, RARITIES, type Rarity } from './common.js'

export const BREW_HOURS_BY_RARITY: Record<Rarity, number> = {
  Common: 8,
  Uncommon: 24,
  Rare: 80,
  'Very Rare': 240,
}

export const BREW_SESSION_HOURS = 8

export const recipeSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  name: z.string(),
  rarity: z.enum(RARITIES),
  known: z.boolean(),
  ingredients: z.string(),
  description: z.string(),
  createdAt: z.string(),
})
export type Recipe = z.infer<typeof recipeSchema>

export const createRecipeSchema = z.object({
  name: nameField,
  rarity: z.enum(RARITIES),
  ingredients: z.string().trim().max(1000),
  description: longText,
})
export type CreateRecipe = z.infer<typeof createRecipeSchema>

export const updateRecipeSchema = createRecipeSchema.extend({ known: z.boolean() }).partial()
export type UpdateRecipe = z.infer<typeof updateRecipeSchema>

export const ingredientSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  name: z.string(),
  rarity: z.enum(RARITIES),
  qty: z.number().int(),
  createdAt: z.string(),
})
export type Ingredient = z.infer<typeof ingredientSchema>

export const createIngredientSchema = z.object({ name: nameField, rarity: z.enum(RARITIES) })
export type CreateIngredient = z.infer<typeof createIngredientSchema>

export const updateIngredientSchema = createIngredientSchema.extend({ qty: count }).partial()
export type UpdateIngredient = z.infer<typeof updateIngredientSchema>

export const activeBrewSchema = z.object({
  name: z.string(),
  rarity: z.enum(RARITIES),
  hoursLogged: z.number().int(),
  hoursTotal: z.number().int(),
  gold: z.number().int(),
})
export type ActiveBrew = z.infer<typeof activeBrewSchema>

/** Level and thresholds are the player's to set by hand; logging exp only adds. */
export const brewingStateSchema = z.object({
  level: z.number().int(),
  exp: z.number().int(),
  expAtLevel: z.number().int(),
  expToNext: z.number().int(),
  activeBrew: activeBrewSchema.nullable(),
})
export type BrewingState = z.infer<typeof brewingStateSchema>

export const updateBrewingLevelSchema = z
  .object({ level: count, exp: count, expAtLevel: count, expToNext: count })
  .partial()
export type UpdateBrewingLevel = z.infer<typeof updateBrewingLevelSchema>

export const logExpSchema = z.object({ amount: z.number().int().min(1).max(100_000) })
export type LogExp = z.infer<typeof logExpSchema>

/** Hours come from the recipe's rarity, server-side. */
export const startBrewSchema = z.object({ recipeId: z.string(), gold: count })
export type StartBrew = z.infer<typeof startBrewSchema>
