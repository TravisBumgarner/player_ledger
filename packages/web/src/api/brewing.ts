import type {
  ApiResponse,
  BrewingState,
  CreateIngredient,
  CreateRecipe,
  Ingredient,
  LogExp,
  Recipe,
  StartBrew,
  UpdateBrewingLevel,
  UpdateIngredient,
  UpdateRecipe,
} from '@awesomeness-mgmt/shared'
import { apiFetch } from './client'

const base = (characterId: string) => `/characters/${encodeURIComponent(characterId)}/brewing`

export function getBrewingState(characterId: string): Promise<ApiResponse<BrewingState>> {
  return apiFetch(base(characterId))
}

export function updateBrewingLevel(
  characterId: string,
  body: UpdateBrewingLevel,
): Promise<ApiResponse<BrewingState>> {
  return apiFetch(`${base(characterId)}/level`, { method: 'PATCH', body })
}

export function logExp(characterId: string, body: LogExp): Promise<ApiResponse<BrewingState>> {
  return apiFetch(`${base(characterId)}/exp`, { method: 'POST', body })
}

export function startBrew(
  characterId: string,
  body: StartBrew,
): Promise<ApiResponse<BrewingState>> {
  return apiFetch(`${base(characterId)}/brew`, { method: 'POST', body })
}

export function logBrewSession(characterId: string): Promise<ApiResponse<BrewingState>> {
  return apiFetch(`${base(characterId)}/brew/session`, { method: 'POST' })
}

export function clearBrew(characterId: string): Promise<ApiResponse<BrewingState>> {
  return apiFetch(`${base(characterId)}/brew`, { method: 'DELETE' })
}

export function getRecipes(characterId: string): Promise<ApiResponse<Recipe[]>> {
  return apiFetch(`${base(characterId)}/recipes`)
}

export function createRecipe(
  characterId: string,
  body: CreateRecipe,
): Promise<ApiResponse<Recipe>> {
  return apiFetch(`${base(characterId)}/recipes`, { method: 'POST', body })
}

export function updateRecipe(
  characterId: string,
  recipeId: string,
  body: UpdateRecipe,
): Promise<ApiResponse<Recipe>> {
  return apiFetch(`${base(characterId)}/recipes/${encodeURIComponent(recipeId)}`, {
    method: 'PATCH',
    body,
  })
}

export function deleteRecipe(
  characterId: string,
  recipeId: string,
): Promise<ApiResponse<{ id: string }>> {
  return apiFetch(`${base(characterId)}/recipes/${encodeURIComponent(recipeId)}`, {
    method: 'DELETE',
  })
}

export function getIngredients(characterId: string): Promise<ApiResponse<Ingredient[]>> {
  return apiFetch(`${base(characterId)}/ingredients`)
}

export function createIngredient(
  characterId: string,
  body: CreateIngredient,
): Promise<ApiResponse<Ingredient>> {
  return apiFetch(`${base(characterId)}/ingredients`, { method: 'POST', body })
}

export function updateIngredient(
  characterId: string,
  ingredientId: string,
  body: UpdateIngredient,
): Promise<ApiResponse<Ingredient>> {
  return apiFetch(`${base(characterId)}/ingredients/${encodeURIComponent(ingredientId)}`, {
    method: 'PATCH',
    body,
  })
}

export function deleteIngredient(
  characterId: string,
  ingredientId: string,
): Promise<ApiResponse<{ id: string }>> {
  return apiFetch(`${base(characterId)}/ingredients/${encodeURIComponent(ingredientId)}`, {
    method: 'DELETE',
  })
}
