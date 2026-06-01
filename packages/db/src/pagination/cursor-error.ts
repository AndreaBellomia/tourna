export class InvalidCursorError extends Error {
  constructor(message = 'Invalid pagination cursor') {
    super(message)
    this.name = 'InvalidCursorError'
  }
}
