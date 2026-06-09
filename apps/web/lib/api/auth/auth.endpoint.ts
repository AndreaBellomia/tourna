export const authEndpoints = {
  login: '/auth/login',
  signup: '/auth/signup',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  verifyEmail: '/auth/email-verification/verify',
  resendEmailVerification: '/auth/email-verification/resend',
} as const
