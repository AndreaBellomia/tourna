import { z } from 'zod'

export type EmailTemplateSchemaRecord = Record<string, z.ZodTypeAny>

export function createEmailTemplatePayloadSchema(
  collections: readonly EmailTemplateSchemaRecord[],
) {
  const variants = collections.flatMap((collection) =>
    Object.entries(collection).map(([template, schema]) =>
      z.object({
        template: z.literal(template),
        data: schema,
      }),
    ),
  )

  const [first, ...rest] = variants

  if (!first) {
    throw new Error('At least one email template schema must be registered')
  }

  return z.discriminatedUnion('template', [first, ...rest])
}

export function createEmailTemplateNames(collections: readonly EmailTemplateSchemaRecord[]) {
  return Object.freeze(
    Object.fromEntries(
      collections.flatMap((collection) => Object.keys(collection).map((key) => [key, key])),
    ),
  ) as Record<string, string>
}
