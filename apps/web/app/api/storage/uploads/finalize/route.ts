import { FinalizeUploadSchema, StorageObjectResponseSchema } from '@repo/contracts'
import {
  authenticatedApiRequest,
  jsonWithAuth,
} from '../../../../../lib/api/auth/authenticated-request'
import { storageEndpoints } from '../../../../../lib/api/storage/storage.endpoint'
import { withRouteHandler } from '../../../../../lib/api/with-route-handler'

export const POST = withRouteHandler(async (request) => {
  const payload = FinalizeUploadSchema.parse(await request.json())
  const result = await authenticatedApiRequest(
    request,
    storageEndpoints.finalizeUpload,
    StorageObjectResponseSchema,
    {
      method: 'POST',
      body: payload,
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result)
})
