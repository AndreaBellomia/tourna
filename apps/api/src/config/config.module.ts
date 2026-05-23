import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env.schema'
import { AppConfigService } from './config.service'
import { treeifyError } from 'zod'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      validate: (config) => {
        const parsed = envSchema.safeParse(config)

        if (!parsed.success) {
          console.error(treeifyError(parsed.error))
          throw new Error('Invalid env vars')
        }

        return parsed.data
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
