import { getWebBackendConfig } from '../backend/config'

export function getApiBaseUrl() {
  return getWebBackendConfig().API_BASE_URL
}

export function apiUrl(path: string) {
  const apiBaseUrl = getApiBaseUrl()
  const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`
  const relativePath = path.startsWith('/') ? path.slice(1) : path

  return new URL(relativePath, baseUrl).toString()
}
