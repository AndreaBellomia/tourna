import { notFound } from "next/navigation"
import { isLocale } from "../../lib/i18n/config"

export function generateStaticParams() {
  return [{ locale: "it" }, { locale: "en" }]
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return children
}
