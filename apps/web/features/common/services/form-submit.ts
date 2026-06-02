'use client'

import { useState, useTransition } from 'react'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'
import { readZodFieldErrors } from './client-validation'

type SubmitNoticeHelpers = {
  setNotice: (message: string | null) => void
}

type UseZodSubmitOptions<TValues extends FieldValues, TSchema extends z.ZodType, TResult> = {
  failedMessage: string
  form: UseFormReturn<TValues>
  invalidMessage: string
  normalize?: (values: TValues) => unknown
  onSuccess: (result: TResult, helpers: SubmitNoticeHelpers) => void
  schema: TSchema
  submit: (values: z.infer<TSchema>) => Promise<TResult>
}

export function useZodSubmit<TValues extends FieldValues, TSchema extends z.ZodType, TResult>({
  failedMessage,
  form,
  invalidMessage,
  normalize,
  onSuccess,
  schema,
  submit,
}: UseZodSubmitOptions<TValues, TSchema, TResult>) {
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onSubmit(values: TValues) {
    const parsed = schema.safeParse(normalize ? normalize(values) : values)
    setNotice(null)

    if (!parsed.success) {
      const fieldErrors = readZodFieldErrors(parsed.error)
      for (const [field, issues] of Object.entries(fieldErrors)) {
        form.setError(field as Path<TValues>, {
          message: issues?.[0] ?? invalidMessage,
        })
      }
      return
    }

    startTransition(() => {
      void submit(parsed.data)
        .then((result) => onSuccess(result, { setNotice }))
        .catch((error: unknown) => {
          setNotice(error instanceof Error ? error.message : failedMessage)
        })
    })
  }

  return {
    isPending,
    notice,
    onSubmit,
    setNotice,
  }
}
