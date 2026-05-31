import 'i18next'
import type { EmailI18nResourceShape } from './resources'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'shell'
    resources: EmailI18nResourceShape
  }
}
