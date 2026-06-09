import { z } from 'zod'

export const SignupSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
})

export type SignupInput = z.infer<typeof SignupSchema>

export const LoginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export type RefreshInput = z.infer<typeof RefreshSchema>

export const VerifyEmailSchema = z.object({
  token: z.string().min(32).max(512),
})

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>
