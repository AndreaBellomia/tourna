export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

export class UploadNotFoundError extends StorageError {
  constructor(uploadId: string) {
    super(`Upload "${uploadId}" was not found or has expired`)
    this.name = 'UploadNotFoundError'
  }
}

export class UploadAlreadyFinalizedError extends StorageError {
  constructor(uploadId: string) {
    super(`Upload "${uploadId}" has already been finalized`)
    this.name = 'UploadAlreadyFinalizedError'
  }
}

export class UploadedObjectMissingError extends StorageError {
  constructor(uploadId: string) {
    super(`Uploaded object for "${uploadId}" does not exist`)
    this.name = 'UploadedObjectMissingError'
  }
}
