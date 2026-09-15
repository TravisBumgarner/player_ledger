import { z } from 'zod'

// The only file in this package allowed to touch import.meta.env.
const envSchema = z.object({
  VITE_PUBLIC_API_BASE_URL: z.string().default('/api'),
})

const envVars = {
  VITE_PUBLIC_API_BASE_URL: import.meta.env.VITE_PUBLIC_API_BASE_URL,
}

/**
 * Vite inlines these at *build* time, so a missing one ships a bundle with
 * `undefined` in it and fails in the browser rather than here. Add production-only
 * requirements with a `superRefine` gated on `import.meta.env.PROD`.
 */
const parsed = envSchema.safeParse(envVars)
if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsed.error.format(), null, 2)}`,
  )
}

export default {
  apiBaseUrl: parsed.data.VITE_PUBLIC_API_BASE_URL,
  isProduction: import.meta.env.PROD,
}
