import { z } from 'zod'

const backendEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE_URL: z.string().url().default('http://localhost:3001/api'),
})

export type WebBackendEnv = z.infer<typeof backendEnvSchema>

export type WebBackendConfig = {
  apiBaseUrl: string
  isProduction: boolean
  nodeEnv: WebBackendEnv['NODE_ENV']
}

let cachedConfig: WebBackendEnv | undefined

export function getWebBackendConfig(): WebBackendEnv {
  cachedConfig ??= createWebBackendConfig()

  return cachedConfig
}

function createWebBackendConfig(): WebBackendEnv {
  const env = backendEnvSchema.parse(process.env)

  return backendEnvSchema.parse(process.env)
}
