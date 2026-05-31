# Storage

Tourna stores static files and media through `@repo/storage`, an S3-compatible package used by API and worker code.

## Buckets

- `tourna-public-assets`: public media that may be exposed through a stable public URL or CDN.
- `tourna-private-assets`: private media read through short-lived presigned `GET` URLs after resource-specific authorization.

The bucket names are configurable with `STORAGE_PUBLIC_BUCKET` and `STORAGE_PRIVATE_BUCKET`.

## Object Keys

Pending uploads use temporary keys:

```text
tmp/{uploadId}/{filename}
```

Finalized assets use:

```text
{public|private}/{assetType}/{ownerScope}/{yyyy}/{mm}/{assetId}/{filename}
```

`ownerScope` and `assetId` are deliberately generic so feature modules can map assets to users, organizations, tournaments, matches, or result submissions without changing storage infrastructure.

## Direct Upload Flow

1. Client calls `POST /api/storage/uploads/presign`.
2. API writes a pending upload record to Redis and returns a presigned `PUT` URL.
3. Client uploads the file directly to the returned URL with the returned headers.
4. Client calls `POST /api/storage/uploads/finalize` with `uploadId`.
5. API verifies the temporary object exists, copies it to the final key, deletes the temporary object, marks Redis state finalized, and returns the storage descriptor.
6. The feature module associates that descriptor with its own resource.

Final association is intentionally outside `@repo/storage`; the package owns file transport and lifecycle, not product-specific persistence.

Private read URLs are intentionally exposed only as a service/package capability. HTTP endpoints should be added per feature, after checking that the current user can access the resource that owns the object.

## Cleanup

Pending uploads are tracked in Redis with TTL plus a sorted expiry index. The worker registers `maintenance.storage.cleanup-orphans.v1` every 10 minutes and deletes expired `tmp/` objects that were never finalized.

## Local MinIO

Start local infrastructure:

```bash
docker compose -f docker/docker-compose.yml up -d
```

API and worker defaults target MinIO with:

```text
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY_ID=tourna
STORAGE_SECRET_ACCESS_KEY=tourna-secret
STORAGE_FORCE_PATH_STYLE=true
STORAGE_PUBLIC_BUCKET=tourna-public-assets
STORAGE_PRIVATE_BUCKET=tourna-private-assets
STORAGE_PUBLIC_BASE_URL=http://localhost:9000/tourna-public-assets
```

MinIO console is available at `http://localhost:9001`.

## Image Transformations

The current implementation stores originals and defines reusable variant names in `@repo/storage`.

Recommended next step, once product image requirements are concrete:

- add a worker job that consumes finalized image descriptors
- use Sharp to generate deterministic variants
- store variants beside the original under `{originalKey}/variants/{name}.{format}`
- persist variant descriptors in the future media/resource table

This avoids putting CPU-heavy image work in the request path while keeping the path convention ready.
