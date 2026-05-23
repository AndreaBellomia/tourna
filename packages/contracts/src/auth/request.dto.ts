import { createZodDto } from 'nestjs-zod'
import { LoginSchema, RefreshSchema, SignupSchema } from './request.schema'

export class SignupDto extends createZodDto(SignupSchema) {}

export class LoginDto extends createZodDto(LoginSchema) {}

export class RefreshDto extends createZodDto(RefreshSchema) {}
