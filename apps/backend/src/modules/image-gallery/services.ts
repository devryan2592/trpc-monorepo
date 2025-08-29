import {
  checkAndCreateBucket,
  deleteBucket,
  deleteFile,
  getFileUrl,
  uploadFile,
} from "../minio/services";

import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileCleanUp } from "../../utils/multer";
import { CustomMulterFile } from "./types";
import {
  BucketOperationError,
  FileUploadError,
  FileDeletionError,
  UrlGenerationError,
} from "./errors";

/**
 * Creates a MinIO-compliant bucket name from a given string
 * @description Converts a user-provided name into a valid MinIO bucket name following all naming conventions
 * @param {string} name - The original name to convert
 * @returns {string} A valid MinIO bucket name with unique suffix
 * @example
 * createBucketName("My Gallery") // Returns: "my-gallery-abc12345"
 */
export const createBucketName = (name: string): string => {
  // Convert to lowercase and remove special characters
  let bucketName = name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");

  // Ensure it starts and ends with alphanumeric character
  bucketName = bucketName.replace(/^[^a-z0-9]+/, "").replace(/[^a-z0-9]+$/, "");

  // Remove consecutive periods and hyphens
  bucketName = bucketName.replace(/\.{2,}/g, ".").replace(/-{2,}/g, "-");

  // Remove period adjacent to hyphen
  bucketName = bucketName.replace(/\.-|-\./g, "-");

  // Ensure minimum length of 3 characters
  if (bucketName.length < 3) {
    bucketName = bucketName + "-" + uuidv4().substring(0, 6).replace(/-/g, "");
  }

  // Ensure maximum length of 63 characters
  if (bucketName.length > 63) {
    bucketName =
      bucketName.substring(0, 57) +
      "-" +
      uuidv4().substring(0, 5).replace(/-/g, "");
  }

  // Add unique suffix to ensure uniqueness
  const uniqueSuffix = uuidv4().substring(0, 8).replace(/-/g, "");
  const maxBaseLength = 63 - uniqueSuffix.length - 1; // -1 for the hyphen

  if (bucketName.length > maxBaseLength) {
    bucketName = bucketName.substring(0, maxBaseLength);
  }

  bucketName = bucketName + "-" + uniqueSuffix;

  // Final validation: ensure it doesn't start with 'xn--' or end with '-s3alias'
  if (bucketName.startsWith("xn--")) {
    bucketName = "bucket-" + bucketName.substring(4);
  }

  if (bucketName.endsWith("-s3alias")) {
    bucketName = bucketName.substring(0, bucketName.length - 8) + "-bucket";
  }

  // Ensure it's not an IP address format (simple check)
  const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (ipRegex.test(bucketName)) {
    bucketName = "bucket-" + bucketName.replace(/\./g, "-");
  }

  return bucketName;
};

// Folder Services

/**
 * Creates a MinIO bucket for image gallery folder
 * @description Creates a bucket in MinIO storage and returns the bucket name
 * @param {Object} data - The folder creation data
 * @param {string} data.name - The name of the folder to create
 * @returns {Promise<string>} The created bucket name
 * @throws {Error} When bucket creation fails
 * @example
 * const bucketName = await createImageGalleryFolderBucket({ name: "My Photos" });
 */
export const createImageGalleryFolderBucket = async (data: { name: string }): Promise<string> => {
  try {
    // Create a unique bucket name from the provided name
    const bucketName = createBucketName(data.name);

    const bucketCreated = await checkAndCreateBucket(bucketName);

    if (!bucketCreated) {
      throw new BucketOperationError("create", bucketName);
    }

    return bucketName;
  } catch (error) {
    console.error("Error creating image gallery folder bucket: ", error);
    if (error instanceof BucketOperationError) {
      throw error;
    }
    throw new BucketOperationError("create", "unknown", error as Error);
  }
};

// Removed getImageGalleryFolders - now handled by tRPC

// Removed getImageGalleryFolderById - now handled by tRPC

/**
 * Deletes a MinIO bucket for image gallery folder
 * @description Removes the corresponding MinIO bucket
 * @param {string} bucketName - The bucket name to delete
 * @throws {Error} When bucket deletion fails
 * @example
 * await deleteImageGalleryFolderBucket("my-bucket-name");
 */
export const deleteImageGalleryFolderBucket = async (bucketName: string): Promise<void> => {
  try {
    await deleteBucket(bucketName);
  } catch (bucketError) {
    console.error("Error deleting image gallery folder bucket: ", bucketError);
    throw new BucketOperationError(
      "delete",
      bucketName,
      bucketError as Error
    );
  }
};

// Image File Services

/**
 * Uploads a file to MinIO storage
 * @description Uploads a file to MinIO storage and returns file metadata
 * @param {Object} data - The file upload data
 * @param {CustomMulterFile} data.file - The uploaded file object from multer
 * @param {string} data.bucketName - The bucket name to upload to
 * @returns {Promise<{fileName: string, originalName: string, size: number, mimeType: string}>} File metadata
 * @throws {Error} When file upload fails
 * @example
 * const fileData = await uploadImageFile({ file: uploadedFile, bucketName: "my-bucket" });
 */
export const uploadImageFile = async (data: {
  file: CustomMulterFile;
  bucketName: string;
}): Promise<{
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
}> => {
  try {
    // Generate a unique filename
    const fileExtension = path.extname(data.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    // upload file to minio
    let uploadResult;
    try {
      uploadResult = await uploadFile(data.bucketName, fileName, data.file);

      if (!uploadResult) {
        throw new FileUploadError(fileName);
      }
    } catch (uploadError) {
      throw new FileUploadError(fileName, uploadError as Error);
    }

    // Clean Up
    await fileCleanUp(data.file.path);

    return {
      fileName,
      originalName: data.file.originalname,
      size: data.file.size,
      mimeType: data.file.mimetype,
    };
  } catch (error) {
    console.error("Error uploading image file: ", error);
    if (error instanceof FileUploadError) {
      throw error;
    }
    throw new FileUploadError("unknown", error as Error);
  }
};


/**
 * Deletes an image file from MinIO storage
 * @description Removes an image file from MinIO storage
 * @param {string} bucketName - The bucket name
 * @param {string} fileName - The file name to delete
 * @throws {Error} When storage deletion fails
 * @example
 * await deleteImageFileFromStorage("my-bucket", "file.jpg");
 */
export const deleteImageFileFromStorage = async (
  bucketName: string,
  fileName: string
): Promise<void> => {
  try {
    await deleteFile(bucketName, fileName);
  } catch (deleteError) {
    console.error("Error deleting image file from storage: ", deleteError);
    throw new FileDeletionError(fileName, deleteError as Error);
  }
};

/**
 * Generates a presigned URL for accessing an image file by file ID
 * @description Gets file metadata from database and creates a temporary URL for downloading or viewing an image file from MinIO storage
 * @param {string} fileId - The file ID to get URL for
 * @returns {Promise<string>} The presigned URL for the image file
 * @throws {Error} When file retrieval or URL generation fails
 * @example
 * const url = await getImageFileUrl("file-uuid-123");
 * console.log("File URL:", url);
 */
export const getImageFileUrl = async (fileId: string): Promise<string> => {
  try {
    // Get file metadata from database via tRPC
    const { appRouter, createTRPCContext } = await import("@workspace/trpc");
    const headers = new Headers();
    const ctx = await createTRPCContext({ headers });
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.imageGallery.getFileById({ id: fileId });
    
    // Generate presigned URL using file metadata
    const url = await getImageFileUrlFromStorage(
      result.file.bucketName,
      result.file.fileName
    );
    
    return url;
  } catch (error) {
    console.error("Error getting image file url: ", error);
    throw new UrlGenerationError(fileId, error as Error);
  }
};

/**
 * Generates a presigned URL for accessing an image file
 * @description Creates a temporary URL for downloading or viewing an image file from MinIO storage
 * @param {string} bucketName - The bucket name
 * @param {string} fileName - The file name
 * @returns {Promise<string>} The presigned URL for the image file
 * @throws {Error} When URL generation fails
 * @example
 * const url = await getImageFileUrlFromStorage("my-bucket", "file.jpg");
 * console.log("File URL:", url);
 */
export const getImageFileUrlFromStorage = async (
  bucketName: string,
  fileName: string
): Promise<string> => {
  try {
    const url = await getFileUrl(bucketName, fileName);
    return url;
  } catch (urlError) {
    console.error("Error getting image file url from storage: ", urlError);
    throw new UrlGenerationError(fileName, urlError as Error);
  }
};
