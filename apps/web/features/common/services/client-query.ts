'use client'

export type ClientQueryValue = string | number | boolean | null | undefined
export type ClientQueryParams = Record<string, ClientQueryValue>

export function buildClientQueryString(query: ClientQueryParams = {}) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }

  return params.toString()
}

export function appendClientQuery(path: string, query: ClientQueryParams = {}) {
  const search = buildClientQueryString(query)

  if (!search) {
    return path
  }

  return `${path}${path.includes('?') ? '&' : '?'}${search}`
}
