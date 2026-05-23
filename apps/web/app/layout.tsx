import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getMessages } from "../lib/i18n/messages";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const messages = getMessages("it");

export const metadata: Metadata = {
  title: {
    default: messages.metadata.appName,
    template: messages.metadata.template,
  },
  description: messages.metadata.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
