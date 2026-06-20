import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { defaultLocale } from '~/lib/i18n/config'
import metadataMessages from '~/lib/i18n/locales/en/metadata'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: metadataMessages.appName,
    template: metadataMessages.template,
  },
  description: metadataMessages.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={defaultLocale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
