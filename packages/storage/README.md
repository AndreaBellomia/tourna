# @repo/storage

S3-compatible storage infrastructure for Tourna.

The package owns reusable storage concerns:

- S3 client creation for AWS S3, MinIO, or compatible providers
- bucket selection for public and private assets
- object key conventions
- presigned upload and download URLs
- Redis-backed upload tracking, finalization, and orphan cleanup

Apps should compose this package through framework adapters instead of placing S3 protocol details in controllers.

## Upload Flow

1. Backend creates a pending upload and returns a presigned `PUT` URL.
2. Client uploads directly to the temporary object key.
3. Client acknowledges upload completion to the backend.
4. Backend verifies the object exists, copies it to the final key, deletes the temporary object, and marks the upload finalized.
5. A maintenance job calls orphan cleanup for expired pending uploads.

Pending upload metadata expires automatically in Redis. Finalized upload metadata is also short-lived on purpose so successful uploads do not leave long-lived `storage:v1:upload:*` keys behind after the temporary object has already been removed.

Temporary keys live under `tmp/{uploadId}/{filename}` in the target bucket.

Final keys use:

```text
{public|private}/{assetType}/{ownerScope}/{yyyy}/{mm}/{assetId}/{filename}
```

Private assets should be read through presigned `GET` URLs. Public assets can be served through `publicBaseUrl` or a CDN mapped to the public bucket.

## Integration testing strategy

Storage integration tests should use S3-compatible behavior rather than mocking the AWS SDK when
the flow depends on object existence, copy/delete semantics, or presigned URL compatibility.

Recommended isolation:

- run MinIO through Docker Compose or a dedicated test container
- use `@repo/storage/testing` to create test-only public/private buckets per run and worker
- delete the test buckets after each integration suite
- keep Redis upload-tracker keys isolated with the Redis test prefix strategy

Mock the SDK only for pure orchestration tests where S3 protocol behavior is not under test.

Useful commands:

```sh
pnpm --filter @repo/storage test
pnpm --filter @repo/storage test:integration
pnpm --filter @repo/storage test:all
```

`createStorageTestEnvironment()` creates isolated MinIO/S3 buckets and exposes `reset()` and
`destroy()` helpers. Storage tests that exercise upload tracking should compose it with
`createRedisTestEnvironment()` so object state and Redis state are cleaned together.
