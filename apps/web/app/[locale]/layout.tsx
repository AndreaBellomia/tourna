import { I18nProvider } from '~/lib/i18n/client'
import { getPageI18n } from '~/lib/i18n/web-i18n'

export function generateStaticParams() {
  return [{ locale: 'it' }, { locale: 'en' }]
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale, messages } = await getPageI18n(params)

  return (
    <I18nProvider locale={locale} messages={messages}>
      {children}
    </I18nProvider>
  )
}
