type RedisErrorOptions = {
  cause?: unknown
}

export class RedisConnectionError extends Error {
  constructor(message: string, { cause }: RedisErrorOptions = {}) {
    super(message, { cause })

    this.name = 'RedisConnectionError'
  }
}

export class RedisValidationError extends Error {
  constructor(message: string, { cause }: RedisErrorOptions = {}) {
    super(message, { cause })

    this.name = 'RedisValidationError'
  }
}

export class RedisDecodingError extends Error {
  constructor(message: string, { cause }: RedisErrorOptions = {}) {
    super(message, { cause })

    this.name = 'RedisDecodingError'
  }
}
