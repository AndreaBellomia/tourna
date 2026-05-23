import { redirect } from "next/navigation"
import { defaultLocale, withLocale } from "../../lib/i18n/config"

export default function DashboardRedirectPage() {
  redirect(withLocale(defaultLocale, "/dashboard"))
}
