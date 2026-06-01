import { notFound, redirect } from 'next/navigation'
import { ApiError } from './errors/api-error'

type PageDataOptions = {
  context: string
  notFoundStatuses?: readonly number[]
  unauthorizedRedirectTo?: string
}

type OptionalPageDataOptions = {
  context: string
}

export async function getRequiredPageData<T>(
  loader: () => Promise<T>,
  options: PageDataOptions,
): Promise<T> {
  try {
    return await loader()
  } catch (error) {
    handleRequiredPageDataError(error, options)
  }
}

export async function getOptionalPageData<T>(
  loader: () => Promise<T>,
  fallback: T,
  options: OptionalPageDataOptions,
): Promise<T> {
  try {
    return await loader()
  } catch (error) {
    console.warn(`[page-data] ${options.context}`, serializePageDataError(error))
    return fallback
  }
}

function handleRequiredPageDataError(error: unknown, options: PageDataOptions): never {
  if (error instanceof ApiError) {
    const notFoundStatuses = options.notFoundStatuses ?? [404]

    if (notFoundStatuses.includes(error.status)) {
      notFound()
    }

    if (error.status === 401 && options.unauthorizedRedirectTo) {
      redirect(options.unauthorizedRedirectTo)
    }
  }

  console.error(`[page-data] ${options.context}`, serializePageDataError(error))
  throw error
}

function serializePageDataError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
    }
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    }
  }

  return { message: 'Unknown page data error' }
}
