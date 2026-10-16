import { z } from 'zod'

const nameSchema = z.string().trim().min(1).max(80)

export const userSchema = z.object({ id: z.string(), name: z.string(), createdAt: z.string() })

export type User = z.infer<typeof userSchema>

export const createUserSchema = z.object({ name: nameSchema })

export type CreateUser = z.infer<typeof createUserSchema>

export const characterSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  createdAt: z.string(),
})

export type Character = z.infer<typeof characterSchema>

export const createCharacterSchema = z.object({ name: nameSchema })

export type CreateCharacter = z.infer<typeof createCharacterSchema>

export const renameCharacterSchema = createCharacterSchema
export type RenameCharacter = CreateCharacter
