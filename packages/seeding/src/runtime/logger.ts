export interface SeedLogger {
  info(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  error(message: string, meta?: Record<string, unknown>): void
}

export const consoleSeedLogger: SeedLogger = {
  info: (message, meta) => logWithMeta('info', message, meta),
  warn: (message, meta) => logWithMeta('warn', message, meta),
  error: (message, meta) => logWithMeta('error', message, meta),
}

export const silentSeedLogger: SeedLogger = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
}

function logWithMeta(
  level: 'info' | 'warn' | 'error',
  message: string,
  meta?: Record<string, unknown>,
) {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : ''
  console[level](`[seed] ${message}${suffix}`)
}
