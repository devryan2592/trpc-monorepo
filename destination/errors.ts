/**
 * Custom error classes for destination module
 * @description Provides specific error types for better error handling and debugging
 */

/**
 * Base error class for destination operations
 */
export class DestinationError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'DestinationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a destination is not found
 */
export class DestinationNotFoundError extends DestinationError {
  constructor(destinationId: string) {
    super(`Destination with ID '${destinationId}' not found`, 404);
    this.name = 'DestinationNotFoundError';
  }
}

/**
 * Error thrown when an image is not found
 */
export class ImageNotFoundError extends DestinationError {
  constructor(imageId: string) {
    super(`Image with ID '${imageId}' not found`, 404);
    this.name = 'ImageNotFoundError';
  }
}

/**
 * Error thrown when database operations fail
 */
export class DatabaseOperationError extends DestinationError {
  constructor(operation: string, entity: string, originalError?: Error) {
    super(
      `Database ${operation} operation failed for ${entity}: ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'DatabaseOperationError';
  }
}

/**
 * Error thrown when slug generation fails
 */
export class SlugGenerationError extends DestinationError {
  constructor(name: string, originalError?: Error) {
    super(
      `Failed to generate slug for '${name}': ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'SlugGenerationError';
  }
}

/**
 * Error thrown when destination validation fails
 */
export class DestinationValidationError extends DestinationError {
  constructor(field: string, value: string, reason: string) {
    super(
      `Destination validation failed for field '${field}' with value '${value}': ${reason}`,
      400
    );
    this.name = 'DestinationValidationError';
  }
}

/**
 * Error thrown when destination already exists
 */
export class DestinationAlreadyExistsError extends DestinationError {
  constructor(name: string) {
    super(
      `Destination '${name}' already exists`,
      409
    );
    this.name = 'DestinationAlreadyExistsError';
  }
}

/**
 * Error thrown when file operations fail
 */
export class FileOperationError extends DestinationError {
  constructor(operation: string, fileName: string, originalError?: Error) {
    super(
      `File ${operation} operation failed for '${fileName}': ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'FileOperationError';
  }
}

/**
 * Error thrown when URL generation fails
 */
export class UrlGenerationError extends DestinationError {
  constructor(fileName: string, originalError?: Error) {
    super(
      `Failed to generate URL for file '${fileName}': ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'UrlGenerationError';
  }
}

/**
 * Error thrown when image transformation fails
 */
export class ImageTransformationError extends DestinationError {
  constructor(imageId: string, originalError?: Error) {
    super(
      `Failed to transform image '${imageId}': ${originalError?.message || 'Unknown error'}`,
      500
    );
    this.name = 'ImageTransformationError';
  }
}