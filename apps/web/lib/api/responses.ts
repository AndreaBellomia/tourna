import { NextResponse } from 'next/server'
import { ApiError } from './errors/api-error'

export function ok<T>(data: T) {
  return NextResponse.json(data, { status: 200 })
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

export function noContent() {
  return new NextResponse(null, {
    status: 204,
  })
}

export function badRequest(message = 'Bad request', details?: unknown) {
  return new ApiError(400, message, 'BAD_REQUEST', details)
}

export function unauthorized(message = 'Authentication required', details?: unknown) {
  return new ApiError(401, message, 'UNAUTHORIZED', details)
}

export function forbidden(message = 'Forbidden', details?: unknown) {
  return new ApiError(403, message, 'FORBIDDEN', details)
}

export function notFound(message = 'Not found', details?: unknown) {
  return new ApiError(404, message, 'NOT_FOUND', details)
}

export function conflict(message = 'Conflict', details?: unknown) {
  return new ApiError(409, message, 'CONFLICT', details)
}

export function unprocessableEntity(message = 'Unprocessable entity', details?: unknown) {
  return new ApiError(422, message, 'UNPROCESSABLE_ENTITY', details)
}
