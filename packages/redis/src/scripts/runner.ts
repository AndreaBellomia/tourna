import { createHash } from 'crypto'
import { z } from 'zod'
import { RedisClient } from '../client/redis.client'

/**
 * Typed descriptor for a Redis Lua script.
 *
 * - `source`: the raw Lua source, typically imported from a `.lua` file.
 * - `buildArgs`: maps typed params to the flat (keys[], argv[]) pair Redis expects.
 * - `parseResult`: parses the raw Redis response into the typed result via Zod.
 */
export interface LuaScript<TParams, TResult> {
  source: string
  buildArgs(params: TParams): { keys: string[]; argv: (string | number)[] }
  parseResult: z.ZodType<TResult>
}

interface RegisteredEntry {
  sha: string
  source: string
}

/**
 * Executes Lua scripts via EVALSHA with automatic EVAL fallback
 * when the script is not cached on the Redis server.
 *
 * Accepts both low-level `exec()` calls (name + raw arrays) and
 * typed `run()` calls that accept a `LuaScript<TParams, TResult>`.
 */
export class RedisScriptRunner {
  private readonly registry = new Map<string, RegisteredEntry>()

  constructor(private readonly client: RedisClient) {}

  register(name: string, source: string): void {
    const sha = createHash('sha1').update(source).digest('hex')
    this.registry.set(name, { sha, source })
  }

  registerScript<TParams, TResult>(name: string, script: LuaScript<TParams, TResult>): void {
    this.register(name, script.source)
  }

  async exec<T = unknown>(name: string, keys: string[], args: (string | number)[]): Promise<T> {
    const entry = this.registry.get(name)
    if (!entry) {
      throw new Error(`Redis script "${name}" is not registered`)
    }

    try {
      return (await this.client.evalsha(entry.sha, keys.length, ...keys, ...args)) as T
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('NOSCRIPT')) {
        return (await this.client.eval(entry.source, keys.length, ...keys, ...args)) as T
      }
      throw err
    }
  }

  async run<TParams, TResult>(
    name: string,
    script: LuaScript<TParams, TResult>,
    params: TParams,
  ): Promise<TResult> {
    const { keys, argv } = script.buildArgs(params)
    const raw = await this.exec(name, keys, argv)
    return script.parseResult.parse(raw)
  }
}
