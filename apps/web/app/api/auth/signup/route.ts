import { SignupSchema } from "@repo/contracts/auth"
import { signup } from "../../../../lib/api/auth"
import { createAuthErrorResponse, createAuthResponse, readRequestLocale } from "../_shared"

export async function POST(request: Request) {
  const locale = readRequestLocale(request)

  try {
    const payload = SignupSchema.parse(await request.json())
    const auth = await signup(payload)

    return createAuthResponse(auth)
  } catch (error) {
    return createAuthErrorResponse(error, locale)
  }
}
