import 'dotenv/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

// One level up is the api package root from both src/ and dist/, unlike cwd,
// which depends on where the process was started.
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const envSchema = z.object({
  PORT: z.string().regex(/^\d+$/, 'must be a whole number').default('38471'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_PATH: z.string().min(1).default('./data/app.sqlite'),
  FRONTEND_URL: z.string().min(1).default('http://localhost:38472'),
})

// Listed explicitly: bundlers replace `process.env.FOO` statically, so the whole
// object is not enumerable in a built artifact.
const envVars = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_PATH: process.env.DATABASE_PATH,
  FRONTEND_URL: process.env.FRONTEND_URL,
}

const parsed = envSchema.safeParse(envVars)
if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsed.error.format(), null, 2)}`,
  )
}

const nodeEnv = parsed.data.NODE_ENV

export default {
  port: Number.parseInt(parsed.data.PORT, 10),
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  // Against packageRoot, not cwd: `npm run dev` and `npm start` start in different places.
  databasePath: resolve(packageRoot, parsed.data.DATABASE_PATH),
  frontendUrl: parsed.data.FRONTEND_URL,
}
