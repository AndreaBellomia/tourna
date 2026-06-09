import { createStorageClient, type StorageClient } from '@repo/storage'
import { AppConfigService } from '~/config/config.service'
import { STORAGE_CLIENT } from './storage.tokens'

export const storageProvider = {
  provide: STORAGE_CLIENT,
  inject: [AppConfigService],
  useFactory: (config: AppConfigService): StorageClient =>
    createStorageClient({
      endpoint: config.get('STORAGE_ENDPOINT'),
      region: config.get('STORAGE_REGION'),
      accessKeyId: config.get('STORAGE_ACCESS_KEY_ID'),
      secretAccessKey: config.get('STORAGE_SECRET_ACCESS_KEY'),
      forcePathStyle: config.get('STORAGE_FORCE_PATH_STYLE'),
    }),
}
