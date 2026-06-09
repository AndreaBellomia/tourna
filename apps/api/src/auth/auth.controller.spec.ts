import { AuthController } from './auth.controller'
import type { EmailVerificationService } from './services/email-verification.service'
import { AuthService } from './services/auth.service'

describe('AuthController', () => {
  const authMock = {
    signup: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  } as unknown as AuthService
  const emailVerificationMock = {
    verifyEmail: jest.fn(),
    sendVerificationEmailForUser: jest.fn(),
  } as unknown as EmailVerificationService

  let controller: AuthController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new AuthController(authMock, emailVerificationMock)
  })

  const authResponse = {
    accessToken: 'at',
    refreshToken: 'rt',
    sessionId: 's-1',
  }

  it('delegates signup to auth service with user agent and ip', async () => {
    const signupMock = authMock.signup as jest.Mock
    signupMock.mockResolvedValue(authResponse)

    const dto = { email: 'test@example.com', password: 'password123' }
    const req = { headers: { 'user-agent': 'TestAgent' }, ip: '127.0.0.1' }

    const result = await controller.signup(dto, req)

    expect(result).toEqual(authResponse)
    expect(signupMock).toHaveBeenCalledWith(dto, 'TestAgent', '127.0.0.1')
  })

  it('uses empty string when user-agent header is missing', async () => {
    const signupMock = authMock.signup as jest.Mock
    signupMock.mockResolvedValue(authResponse)

    const dto = { email: 'test@example.com', password: 'password123' }
    const req = { headers: {}, ip: '127.0.0.1' }

    await controller.signup(dto, req)

    expect(signupMock).toHaveBeenCalledWith(dto, '', '127.0.0.1')
  })

  it('delegates login to auth service', async () => {
    const loginMock = authMock.login as jest.Mock
    loginMock.mockResolvedValue(authResponse)

    const dto = { email: 'test@example.com', password: 'password123' }
    const req = { headers: { 'user-agent': 'Agent' }, ip: '10.0.0.1' }

    const result = await controller.login(dto, req)

    expect(result).toEqual(authResponse)
    expect(loginMock).toHaveBeenCalledWith(dto, 'Agent', '10.0.0.1')
  })

  it('delegates refresh with the refresh token', async () => {
    const refreshMock = authMock.refresh as jest.Mock
    refreshMock.mockResolvedValue(authResponse)

    const result = await controller.refresh({ refreshToken: 'rt-1' })

    expect(result).toEqual(authResponse)
    expect(refreshMock).toHaveBeenCalledWith('rt-1')
  })

  it('delegates logout with session id from current user', async () => {
    const logoutMock = authMock.logout as jest.Mock
    logoutMock.mockResolvedValue(undefined)

    const user = { userId: 'u-1', sessionId: 's-1' }
    await controller.logout(user)

    expect(logoutMock).toHaveBeenCalledWith('s-1')
  })

  it('delegates email verification by token', async () => {
    const verifyMock = emailVerificationMock.verifyEmail as jest.Mock
    verifyMock.mockResolvedValue({ verified: true })

    const result = await controller.verifyEmail({ token: 'verification-token' })

    expect(result).toEqual({ verified: true })
    expect(verifyMock).toHaveBeenCalledWith('verification-token')
  })

  it('resends email verification for the current user', async () => {
    const resendMock = emailVerificationMock.sendVerificationEmailForUser as jest.Mock
    resendMock.mockResolvedValue(undefined)

    await controller.resendEmailVerification({ userId: 'u-1', sessionId: 's-1' })

    expect(resendMock).toHaveBeenCalledWith('u-1')
  })
})
