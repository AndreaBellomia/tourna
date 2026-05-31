import { z } from 'zod'

export const storageEnvSchema = z.object({
  STORAGE_ENDPOINT: z.string().url().default('http://localhost:9000'),
  STORAGE_REGION: z.string().default('us-east-1'),
  STORAGE_ACCESS_KEY_ID: z.string().default('tourna'),
  STORAGE_SECRET_ACCESS_KEY: z.string().default('tourna-secret'),
  STORAGE_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
  STORAGE_PUBLIC_BUCKET: z.string().default('tourna-public-assets'),
  STORAGE_PRIVATE_BUCKET: z.string().default('tourna-private-assets'),
  STORAGE_PUBLIC_BASE_URL: z.string().url().optional(),
  STORAGE_UPLOAD_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60),
  STORAGE_READ_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 60),
})

export type StorageEnv = z.infer<typeof storageEnvSchema>
