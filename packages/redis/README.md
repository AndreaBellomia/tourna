# @repo/redis

Practical guide to Tourna's Redis package.

This package contains the reusable Redis-specific layer for the monorepo:

- ioredis client creation
- typed models for keys and payloads
- high-level engines for Redis primitives
- typed pipeline and multi support
- Lua script runner
- reusable Redis features, such as auth session management

The goal is to give consumers clear, typed APIs without forcing them to drop down to the raw ioredis client every time.

## Package structure

```text
src/
  client/      ioredis client creation
  codecs/      payload serialization codecs
  core/        models, key factory, engine root, errors
  engine/      engines for kv, hash, list, set, zset
  pipeline/    typed wrapper for pipeline and multi
  scripts/     generic Lua script runner
  features/    reusable Redis features from application domains
```

## Core concepts

### RedisClient

The Redis client is a thin wrapper around ioredis.

```ts
import { createRedisClient } from '@repo/redis'

const client = createRedisClient({
  host: 'localhost',
  port: 6379,
  password: '',
  db: 0,
})
```

The exported type is `RedisClient`, meaning the concrete ioredis instance used internally by engines and the Lua runner.

### RedisEngine

`RedisEngine` is the main entry point for using Redis in a typed way.

```ts
import { createRedisEngine } from '@repo/redis'

const engine = createRedisEngine(client)

await engine.ping()
await engine.kv.get(SomeModel, 'id')
await engine.zset.zrange(SomeIndexModel, 0, -1, 'scope')
```

The engines currently exposed are:

- `engine.kv`
- `engine.hash`
- `engine.list`
- `engine.set`
- `engine.zset`

In addition, `RedisEngine` exposes:

- `engine.pipeline()` for efficient batching
- `engine.multi()` for `MULTI/EXEC` transactions

### Redis model

Models describe how a Redis key is built and how its payload is serialized and validated.

The two main types are:

- `RedisModel<T, R, A>` for primitives with an encoded payload
- `RedisZSetModel<A>` for sorted sets used as indexes or ordered membership sets

Relevant fields:

- `namespace`: logical feature prefix
- `version`: model version inside the key
- `key(...args)`: factory that produces key segments
- `type`: expected Redis type
- `schema`: Zod validation for the payload
- `codec`: encode/decode strategy
- `ttl`: default TTL when the operation supports it

Real example:

```ts
import { z } from 'zod'
import { JsonCodec, type RedisModel, type RedisZSetModel } from '@repo/redis'

const sessionDataSchema = z.object({
  userId: z.string(),
  tokenHash: z.string(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  createdAt: z.number(),
  expiresAt: z.number(),
})

type SessionData = z.infer<typeof sessionDataSchema>

export const SessionModel: RedisModel<SessionData, Buffer, [sessionId: string]> = {
  namespace: 'auth',
  version: 1,
  key: (sessionId) => ['session', sessionId],
  schema: sessionDataSchema,
  type: 'string',
  codec: new JsonCodec<SessionData>(),
  ttl: 0,
}

export const UserSessionsIndexModel: RedisZSetModel<[userId: string]> = {
  namespace: 'auth',
  version: 1,
  key: (userId) => ['user_sessions', userId],
  type: 'zset',
}
```

The full key is composed as:

```text
{namespace}:v{version}:{...keySegments}
```

For example:

```text
auth:v1:session:s-123
auth:v1:user_sessions:u-999
```

## Codecs and validation

The package always validates model-based payloads with Zod and serializes them through a codec.

Available codecs today:

- `JsonCodec<T>`
- `MsgpackCodec<T>`

The shared internal helpers are:

- `buildModelKey(...)`
- `validateModelValue(...)`
- `decodeModelValue(...)`

These are also useful for future extensions, such as new engines or new pipeline operations.

## Day-to-day engine usage

### KV engine

Available operations:

- `get(model, ...args)`
- `set(model, value, ...args)`
- `delete(model, ...args)`
- `rawGet(model, ...args)`
- `rawSet(model, buffer, ...args)`

Example:

```ts
await engine.kv.set(SessionModel, sessionData, sessionId)
const session = await engine.kv.get(SessionModel, sessionId)
await engine.kv.delete(SessionModel, sessionId)
```

### Hash, list, set, zset

The other engines follow the same idea: the consumer passes the model and logical arguments, not the full key.

Examples:

```ts
await engine.hash.hset(ProfileModel, 'field', value, userId)
await engine.list.lpush(JobModel, job, queueName)
await engine.set.add(TagModel, tag, articleId)
await engine.zset.zadd(UserSessionsIndexModel, expiresAt, sessionId, userId)
```

## Pipeline and multi

### Why they exist

The package exposes `pipeline` and `multi` to handle multiple operations in a typed, readable way, avoiding serial `await` loops or scattered direct use of ioredis.

### `engine.pipeline()`

Use `pipeline()` when you want to reduce round-trips but do not need transactional atomicity.

```ts
const pipe = engine.pipeline()

const first = pipe.kv.get(SessionModel, 's-1')
const second = pipe.kv.get(SessionModel, 's-2')
const sessions = pipe.zset.zrange(UserSessionsIndexModel, 0, -1, 'u-1')

await pipe.exec()

console.log(first.value)
console.log(second.value)
console.log(sessions.value)
```

### `engine.multi()`

Use `multi()` when you want a `MULTI/EXEC` block on Redis.

```ts
const tx = engine.multi()

const addResult = tx.zset.zadd(UserSessionsIndexModel, expiresAt, sessionId, userId)
const setResult = tx.kv.set(SessionModel, sessionData, sessionId)

await tx.exec()

console.log(addResult.value)
console.log(setResult.value)
```

### `PendingResult<T>`

Every operation registered on a pipeline or multi returns a `PendingResult<T>`.

Practical rules:

- before `exec()`, reading `.value` throws
- after `exec()`, `.value` contains the typed result
- if Redis returned an error for that command, `.value` rethrows it
- `resolved` indicates whether the result has already been materialized

Example:

```ts
const pipe = engine.pipeline()
const session = pipe.kv.get(SessionModel, sessionId)

console.log(session.resolved) // false
await pipe.exec()
console.log(session.resolved) // true
console.log(session.value)
```

### Operations supported today in pipeline/multi

On `kv`:

- `get`
- `set`
- `delete`

On `zset`:

- `zadd`
- `zrem`
- `zrange`
- `zrangebyscore`
- `zremrangebyscore`
- `zscore`

If you need `hash`, `list`, or `set`, follow the same pattern used in `src/pipeline/`.

### When to use pipeline, multi, or Lua

Use `pipeline` when:

- you are doing many independent reads or writes
- you want fewer round-trips
- you do not need strong atomicity

Use `multi` when:

- you want to group multiple writes into a Redis transaction
- ordering and commit atomicity matter

Use Lua when:

- the logic is composed and reusable
- you want to run everything server-side in one round-trip
- the logic should be shared by future backends
- you want Redis-specific details kept inside the package, not inside apps

## Lua scripts

### Infrastructure

The package has a generic runner: `RedisScriptRunner`.

Runner responsibilities:

- register versioned scripts in code
- compute the SHA1 of the Lua source
- try `EVALSHA`
- automatically fall back to `EVAL` on `NOSCRIPT`
- return a typed and validated result

Main API:

- `register(name, source)`
- `registerScript(name, script)`
- `exec(name, keys, args)`
- `run(name, script, params)`

### How to define a new script

Each script normally has two files:

- a `.lua` file with the server-side Redis logic
- a typed `.ts` descriptor that implements `LuaScript<TParams, TResult>`

Example structure:

```text
src/features/my-feature/lua/
  do-something.lua
  do-something.ts
```

#### 1. Lua file

The `.lua` file should use the classic Redis contract:

- `KEYS[...]` for keys
- `ARGV[...]` for arguments

Minimal example:

```lua
local key = KEYS[1]
local value = ARGV[1]
redis.call('SET', key, value)
return 1
```

#### 2. TypeScript descriptor

The `.ts` file should:

- import the Lua source
- define the parameter schema
- define the result schema
- map typed params into `keys` and `argv`
- parse the raw result

Example:

```ts
import { z } from 'zod'
import source from './do-something.lua'
import type { LuaScript } from '../../../scripts/runner'

const paramsSchema = z.object({
  key: z.string(),
  value: z.string(),
})

type Params = z.infer<typeof paramsSchema>

const resultSchema = z.literal(1)

type Result = z.infer<typeof resultSchema>

export const doSomethingScript: LuaScript<Params, Result> = {
  source,
  buildArgs(params) {
    return {
      keys: [params.key],
      argv: [params.value],
    }
  },
  parseResult: resultSchema,
}
```

### How to use a script in a feature

Recommended pattern:

- create a feature-specific class inside the Redis package
- register scripts in the constructor
- expose typed methods at the domain level

Real example: `SessionScripts` in `src/features/session/session.scripts.ts`.

```ts
export class SessionScripts {
  private readonly runner: RedisScriptRunner

  constructor(client: RedisClient) {
    this.runner = new RedisScriptRunner(client)
    this.runner.registerScript('createSession', createSessionScript)
    this.runner.registerScript('rotateRefresh', rotateRefreshScript)
    this.runner.registerScript('revokeSession', revokeSessionScript)
    this.runner.registerScript('getUserSessions', getUserSessionsScript)
  }
}
```

The class then exposes typed methods such as:

- `createSession(...)`
- `rotateRefreshToken(...)`
- `revokeSession(...)`
- `getUserSessions(...)`

This way the app does not need to know about `KEYS`, `ARGV`, `EVALSHA`, JSON parsing, or Redis-specific cleanup logic.

## Concrete example: auth sessions

The session feature is the current reference for how to organize a reusable Redis feature.

It contains:

- the session and refresh-token models
- the user-session zset index
- Lua scripts for composed operations
- the typed `SessionScripts` facade

### `getUserSessions`

The `getUserSessions(userId)` method is now implemented in Lua to avoid a sequence like:

- cleanup expired entries
- read session IDs
- `N` serial or pipelined GETs
- cleanup ghost entries

The script runs server-side:

- `ZREMRANGEBYSCORE`
- `ZRANGE`
- session `GET`
- ghost `ZREM`
- return of a structured result

This pattern is useful when the logic is complex enough to deserve ownership inside the Redis package.

## Concrete example: email verification tokens

Email verification uses the same package-owned model discipline as sessions, but it does not need Lua because the operations are small:

- `EmailVerificationTokenModel`: lookup by hashed token
- `UserEmailVerificationTokenModel`: lookup of the active token for a user
- `EmailVerificationTokenStore`: typed facade used by apps

Keys are versioned under the auth namespace:

```text
auth:v1:email_verification:token:<tokenHash>
auth:v1:email_verification:user:<userId>
```

The raw token sent by email is never stored. API code hashes the token before calling the store, and the store persists only the hash plus metadata. Creating a new token for the same user deletes the previous token key and writes both keys with the same dynamic TTL.

## Integration from `apps/api`

On the NestJS app side, the current pattern is:

- create the client once
- build `RedisEngine`
- expose it through `RedisService`
- use `SessionScripts` or the package engines inside application services

Tourna already has a `RedisService` in `apps/api/src/redis/redis.service.ts` that exposes:

- `engine`
- `getClient()`

Practical guidance:

- prefer `engine` for simple operations
- prefer feature-specific classes like `SessionScripts` for reusable composed logic
- use `getClient()` only when the package layer does not yet cover the use case

## Conventions for extending the package

### 1. Keep boundaries clear

Put in the Redis package:

- Redis models
- Lua scripts
- Redis-specific logic
- batching and round-trip optimizations

Do not put in the Redis package:

- HTTP or NestJS orchestration rules
- controller, guard, or transport DTO details
- domain logic that does not really depend on Redis

### 2. Prefer explicit APIs

Better:

- `engine.kv.get(Model, id)`
- `engine.pipeline().kv.get(Model, id)`
- `sessionScripts.getUserSessions(userId)`

Worse:

- overly dynamic helpers
- wrappers that hide the Redis operation type being executed
- APIs that build keys opaquely outside the models

### 3. Put only the right logic in Lua

A good Lua candidate:

- touches multiple related keys
- performs cleanup or composed fetches
- should be reusable
- benefits from server-side execution

A poor Lua candidate:

- single GET or SET
- trivial logic with no reuse value
- operations already well covered by the typed engines

### 4. Extend pipeline following the existing pattern

To add new pipelined operations:

- create or extend a `Pipeline*Ops` class
- queue the command on `this.pipeline.commander`
- register the decoder with `this.pipeline.track(...)`
- return `PendingResult<T>`
- reuse `buildModelKey`, `validateModelValue`, and `decodeModelValue`

## Quick decision guide

If you need to decide where a new piece of logic belongs, use this sequence:

1. Is it a single simple command? Use an engine.
2. Are there multiple independent commands in the same flow? Use `pipeline()`.
3. Are there multiple writes that should run in `MULTI/EXEC`? Use `multi()`.
4. Is it composed, Redis-specific, and reusable? Create a Lua script plus typed facade in the package.

## Files worth knowing first

Core:

- `src/client/redis.client.ts`
- `src/core/redis.engine.ts`
- `src/core/redis.model.ts`
- `src/engine/base.engine.ts`

Pipeline:

- `src/pipeline/redis.pipeline.ts`
- `src/pipeline/pending-result.ts`
- `src/pipeline/pipeline-kv.ts`
- `src/pipeline/pipeline-zset.ts`

Lua:

- `src/scripts/runner.ts`
- `src/lua.d.ts`

Feature example:

- `src/features/session/session.model.ts`
- `src/features/session/refresh-token.model.ts`
- `src/features/session/session.scripts.ts`
- `src/features/session/lua/*.lua`
- `src/features/session/lua/*.ts`

## Current capability status

Available today:

- typed engines for kv, hash, list, set, zset
- typed pipeline for kv and zset
- typed multi with the same API as pipeline
- Lua runner with `NOSCRIPT` fallback
- auth/session feature already structured in the package

To extend when needed:

- pipeline ops for hash, list, and set
- more reusable Redis features beyond auth
- eventual integration tests against a real Redis instance if the repo setup requires them
