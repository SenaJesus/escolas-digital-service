export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly cause?: unknown

  constructor(statusCode: number, code: string, message: string, cause?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.cause = cause
  }
}

export const badRequest = (message: string, cause?: unknown): AppError =>
  new AppError(400, 'BadRequest', message, cause)

export const unauthorized = (message: string): AppError =>
  new AppError(401, 'Unauthorized', message)

export const forbidden = (message: string): AppError =>
  new AppError(403, 'Forbidden', message)

export const notFound = (message: string): AppError =>
  new AppError(404, 'NotFound', message)

export const conflict = (message: string): AppError =>
  new AppError(409, 'Conflict', message)

export const internal = (message: string, cause?: unknown): AppError =>
  new AppError(500, 'InternalServerError', message, cause)
