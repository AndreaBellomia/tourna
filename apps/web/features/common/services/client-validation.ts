'use client'

import { z } from 'zod'

export function readZodFieldErrors(error: unknown): Record<string, string[] | undefined> {
  if (error instanceof z.ZodError) {
    return z.flattenError(error).fieldErrors
  }

  return {}
}
