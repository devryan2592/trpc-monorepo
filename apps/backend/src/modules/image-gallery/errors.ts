/**
 * Custom error classes for image gallery module
 * @description Provides specific error types for better error handling and debugging
 */

/**
 * Base error class for image gallery operations
 */
export class ImageGalleryError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ImageGalleryError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a folder is not found
 */
export class FolderNotFoundError extends ImageGalleryError {
  constructor(folderId: string) {
    super(`Image gallery folder with ID '${folderId}' not found`, 404);
    this.name = 'FolderNotFoundError';
  }
}

/**
 * Error thrown when a file is not found
 */
export class FileNotFoundError extends ImageGalleryError {
  constructor(fileId: string) {
    super(`Image file with ID '${fileId}' not found`, 404);
    this.name = 'FileNotFoundError';
  }
}

/**
 * Error thrown when bucket operations fail
 */
export class BucketOperationError extends ImageGalleryError {
  constructor(operation: string, bucketName: string, originalError?: Error) {
    super(
      `Failed to ${operation} bucket '${bucketName}': ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'BucketOperationError';
  }
}

/**
 * Error thrown when file upload operations fail
 */
export class FileUploadError extends ImageGalleryError {
  constructor(fileName: string, originalError?: Error) {
    super(
      `Failed to upload file '${fileName}': ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'FileUploadError';
  }
}

/**
 * Error thrown when file deletion operations fail
 */
export class FileDeletionError extends ImageGalleryError {
  constructor(fileName: string, originalError?: Error) {
    super(
      `Failed to delete file '${fileName}': ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'FileDeletionError';
  }
}

/**
 * Error thrown when database operations fail
 */
export class DatabaseOperationError extends ImageGalleryError {
  constructor(operation: string, entity: string, originalError?: Error) {
    super(
      `Database ${operation} operation failed for ${entity}: ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'DatabaseOperationError';
  }
}

/**
 * Error thrown when URL generation fails
 */
export class UrlGenerationError extends ImageGalleryError {
  constructor(fileName: string, originalError?: Error) {
    super(
      `Failed to generate URL for file '${fileName}': ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'UrlGenerationError';
  }
}