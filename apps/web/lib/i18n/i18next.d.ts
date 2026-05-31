import "i18next"
import type { WebI18nResourceShape } from "./resources"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "metadata"
    resources: WebI18nResourceShape
  }
}
