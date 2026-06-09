import { CreatePresignedUploadSchema, PresignedUploadResponseSchema } from '@repo/contracts'
import { authenticatedApiRequest, jsonWithAuth } from '~/lib/api/auth/authenticated-request'
import { storageEndpoints } from '~/lib/api/storage/storage.endpoint'
import { withRouteHandler } from '~/lib/api/with-route-handler'

export const POST = withRouteHandler(async (request) => {
  const payload = CreatePresignedUploadSchema.parse(await request.json())
  const result = await authenticatedApiRequest(
    request,
    storageEndpoints.presignUpload,
    PresignedUploadResponseSchema,
    {
      method: 'POST',
      body: payload,
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result)
})
