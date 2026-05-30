export class PendingResult<T> {
  private _value: T | undefined
  private _error: Error | null = null
  private _resolved = false

  get value(): T {
    if (!this._resolved) {
      throw new Error('Pipeline has not been executed yet. Call exec() first.')
    }
    if (this._error) throw this._error
    return this._value as T
  }

  get resolved(): boolean {
    return this._resolved
  }

  _resolve(val: T): void {
    this._value = val
    this._resolved = true
  }

  _reject(err: Error): void {
    this._error = err
    this._resolved = true
  }
}
