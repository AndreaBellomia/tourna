import { defaultEmailLocale, type EmailLocale } from '../i18n/config'
import {
  getEmailTranslator,
  type EmailNamespaceTranslator,
} from '../i18n/email-i18n'

export interface EmailRenderContext {
  locale: EmailLocale
  shell: EmailNamespaceTranslator<'shell'>
  account: EmailNamespaceTranslator<'account'>
  reports: EmailNamespaceTranslator<'reports'>
}

export async function createEmailRenderContext(
  locale: EmailLocale = defaultEmailLocale,
): Promise<EmailRenderContext> {
  return {
    locale,
    shell: await getEmailTranslator(locale, 'shell'),
    account: await getEmailTranslator(locale, 'account'),
    reports: await getEmailTranslator(locale, 'reports'),
  }
}
