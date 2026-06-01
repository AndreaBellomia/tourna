export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = 'API_ERROR',
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
