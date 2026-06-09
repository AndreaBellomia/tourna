import { createZodDto } from 'nestjs-zod'
import { LoginSchema, RefreshSchema, SignupSchema, VerifyEmailSchema } from './request.schema'

export class SignupDto extends createZodDto(SignupSchema) {}

export class LoginDto extends createZodDto(LoginSchema) {}

export class RefreshDto extends createZodDto(RefreshSchema) {}

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}
