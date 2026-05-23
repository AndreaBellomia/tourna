export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
} as const

export function getApiBaseUrl() {
  return 'http://localhost:3001/api'
}

export function apiUrl(path: string) {
  return new URL(`api${path}`, getApiBaseUrl()).toString()
}
