import type { ChainableCommander } from 'ioredis'
import { PendingResult } from './pending-result'
import { PipelineKVOps } from './pipeline-kv'
import { PipelineZSetOps } from './pipeline-zset'

interface TrackedOp {
  pending: PendingResult<unknown>
  decode: (raw: unknown) => unknown
}

export class RedisPipeline {
  readonly commander: ChainableCommander

  private readonly ops: TrackedOp[] = []

  readonly kv: PipelineKVOps
  readonly zset: PipelineZSetOps

  constructor(commander: ChainableCommander) {
    this.commander = commander
    this.kv = new PipelineKVOps(this)
    this.zset = new PipelineZSetOps(this)
  }

  track<T>(decode: (raw: unknown) => T): PendingResult<T> {
    const pending = new PendingResult<T>()
    this.ops.push({ pending: pending as PendingResult<unknown>, decode })
    return pending
  }

  async exec(): Promise<void> {
    const rawResults = await this.commander.exec()

    if (!rawResults) {
      throw new Error('Pipeline execution returned null (transaction aborted?)')
    }

    if (rawResults.length !== this.ops.length) {
      throw new Error(
        `Pipeline result count mismatch: expected ${this.ops.length}, got ${rawResults.length}`,
      )
    }

    for (let i = 0; i < rawResults.length; i++) {
      const [err, val] = rawResults[i]!
      const { pending, decode } = this.ops[i]!

      if (err) {
        pending._reject(err)
      } else {
        try {
          pending._resolve(decode(val))
        } catch (decodeErr) {
          pending._reject(decodeErr instanceof Error ? decodeErr : new Error(String(decodeErr)))
        }
      }
    }
  }

  get length(): number {
    return this.ops.length
  }
}
