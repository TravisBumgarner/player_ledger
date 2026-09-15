import {
  createIngredientSchema,
  createRecipeSchema,
  logExpSchema,
  startBrewSchema,
  updateBrewingLevelSchema,
  updateIngredientSchema,
  updateRecipeSchema,
} from '@awesomeness-mgmt/shared'
import { type Request, type Response, Router } from 'express'
import {
  clearBrew,
  createIngredient,
  createRecipe,
  deleteIngredient,
  deleteRecipe,
  findRecipe,
  getBrewingState,
  listIngredients,
  listRecipes,
  logBrewSession,
  logExp,
  startBrew,
  toBrewingState,
  toIngredient,
  toRecipe,
  updateBrewingLevel,
  updateIngredient,
  updateRecipe,
} from '../../db/queries/brewing.js'
import { sendError, sendSuccess } from '../shared/responses.js'
import { characterIdOf } from './scope.js'

// Mounted at /api/characters/:characterId/brewing.
const router: Router = Router()

type RecipeParams = { recipeId: string }
type IngredientParams = { ingredientId: string }

async function getState(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, toBrewingState(await getBrewingState(characterIdOf(res))))
}

async function patchLevel(req: Request, res: Response): Promise<void> {
  const parsed = updateBrewingLevelSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toBrewingState(await updateBrewingLevel(characterIdOf(res), parsed.data)))
}

async function postExp(req: Request, res: Response): Promise<void> {
  const parsed = logExpSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toBrewingState(await logExp(characterIdOf(res), parsed.data.amount)))
}

async function postBrew(req: Request, res: Response): Promise<void> {
  const parsed = startBrewSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const characterId = characterIdOf(res)
  const recipe = await findRecipe(characterId, parsed.data.recipeId)
  if (!recipe) return sendError(res, 'NOT_FOUND', 404)
  if (!recipe.known) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toBrewingState(await startBrew(characterId, recipe, parsed.data.gold)))
}

async function postSession(_req: Request, res: Response): Promise<void> {
  const row = await logBrewSession(characterIdOf(res))
  if (!row) return sendError(res, 'INVALID_INPUT', 400)
  sendSuccess(res, toBrewingState(row))
}

async function removeBrew(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, toBrewingState(await clearBrew(characterIdOf(res))))
}

async function getRecipes(_req: Request, res: Response): Promise<void> {
  const rows = await listRecipes(characterIdOf(res))
  sendSuccess(res, rows.map(toRecipe))
}

async function postRecipe(req: Request, res: Response): Promise<void> {
  const parsed = createRecipeSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toRecipe(await createRecipe(characterIdOf(res), parsed.data)), 201)
}

async function patchRecipe(req: Request<RecipeParams>, res: Response): Promise<void> {
  const parsed = updateRecipeSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const row = await updateRecipe(characterIdOf(res), req.params.recipeId, parsed.data)
  if (!row) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, toRecipe(row))
}

async function removeRecipe(req: Request<RecipeParams>, res: Response): Promise<void> {
  const deleted = await deleteRecipe(characterIdOf(res), req.params.recipeId)
  if (!deleted) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, { id: req.params.recipeId })
}

async function getIngredients(_req: Request, res: Response): Promise<void> {
  const rows = await listIngredients(characterIdOf(res))
  sendSuccess(res, rows.map(toIngredient))
}

async function postIngredient(req: Request, res: Response): Promise<void> {
  const parsed = createIngredientSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  sendSuccess(res, toIngredient(await createIngredient(characterIdOf(res), parsed.data)), 201)
}

async function patchIngredient(req: Request<IngredientParams>, res: Response): Promise<void> {
  const parsed = updateIngredientSchema.safeParse(req.body)
  if (!parsed.success) return sendError(res, 'INVALID_INPUT', 400)

  const row = await updateIngredient(characterIdOf(res), req.params.ingredientId, parsed.data)
  if (!row) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, toIngredient(row))
}

async function removeIngredient(req: Request<IngredientParams>, res: Response): Promise<void> {
  const deleted = await deleteIngredient(characterIdOf(res), req.params.ingredientId)
  if (!deleted) return sendError(res, 'NOT_FOUND', 404)
  sendSuccess(res, { id: req.params.ingredientId })
}

router.get('/', getState)
router.patch('/level', patchLevel)
router.post('/exp', postExp)
router.post('/brew', postBrew)
router.post('/brew/session', postSession)
router.delete('/brew', removeBrew)

router.get('/recipes', getRecipes)
router.post('/recipes', postRecipe)
router.patch('/recipes/:recipeId', patchRecipe)
router.delete('/recipes/:recipeId', removeRecipe)

router.get('/ingredients', getIngredients)
router.post('/ingredients', postIngredient)
router.patch('/ingredients/:ingredientId', patchIngredient)
router.delete('/ingredients/:ingredientId', removeIngredient)

export default router
