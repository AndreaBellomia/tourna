import { redirect } from "next/navigation"
import { defaultLocale, withLocale } from "../lib/i18n/config"

export default function Home() {
  redirect(withLocale(defaultLocale, "/login"))
}
