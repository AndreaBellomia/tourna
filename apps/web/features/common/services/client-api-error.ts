'use client'

export type ClientApiErrorOptions = {
  code?: string
  details?: unknown
}

export class ClientApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, message: string, options: ClientApiErrorOptions = {}) {
    super(message)
    this.name = 'ClientApiError'
    this.status = status
    this.code = options.code ?? 'API_ERROR'
    this.details = options.details
  }
}

export function isUnauthorizedClientApiError(error: unknown): error is ClientApiError {
  return error instanceof ClientApiError && error.status === 401
}
