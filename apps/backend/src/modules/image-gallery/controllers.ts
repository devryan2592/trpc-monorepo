import { Request, Response } from "express";

import {
  createImageGalleryFolderBucket,
  deleteImageGalleryFolderBucket,
  uploadImageFile,
  deleteImageFileFromStorage,
  getImageFileUrl,
} from "./services";
import { CustomMulterFile } from "./types";
import {
  createImageFileSchema,
  createImageGalleryFolderSchema,
  deleteImageFileSchema,
  deleteImageGalleryFolderSchema,
  getImageFileUrlSchema,
} from "./schemas";
import { appRouter, createTRPCContext } from "@workspace/trpc";
import { HTTP_STATUS } from "../../constants/http-status";

// Folder Controllers

/**
 * Creates a new image gallery folder
 * @description Creates a bucket in MinIO and then creates a database record via tRPC
 * @route POST /api/image-gallery/folders
 * @param {Request} req - Express request object containing folder name in body
 * @param {Response<ApiResponse<CreateImageFolderResponseType>>} res - Express response object
 * @returns {Promise<Response>} Success response with created folder data
 * @throws {400} Bad Request - Invalid input data
 * @throws {500} Internal Server Error - Bucket creation or database operation failure
 */
export const createImageGalleryFolderController = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("req.body", req.body);
    const { data, success, error } = createImageGalleryFolderSchema.safeParse(
      req.body
    );

    if (!success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    // 1. Create bucket in MinIO
    const bucketName = await createImageGalleryFolderBucket(data);

    // 2. Create database record via tRPC
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      }
    }
    const ctx = await createTRPCContext({ headers });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.imageGallery.createFolderRecord({
      name: data.name,
      bucketName: bucketName,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Image gallery folder created successfully",
      data: { folder: result.folder },
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Deletes an image gallery folder
 * @description Removes a folder from database via tRPC and then deletes the associated bucket
 * @route DELETE /api/image-gallery/folders/:id
 * @param {Request} req - Express request object with folder ID in params
 * @param {Response<ApiResponse>} res - Express response object
 * @returns {Promise<Response>} Success response confirming deletion
 * @throws {400} Bad Request - Invalid folder ID
 * @throws {404} Not Found - Folder does not exist
 * @throws {500} Internal Server Error - Database or bucket deletion failure
 */
export const deleteImageGalleryFolderController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const { success, error } = deleteImageGalleryFolderSchema.safeParse({
      folderId: id,
    });

    if (!success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    // 1. Delete database record via tRPC (this returns the folder with bucketName)
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      }
    }
    const ctx = await createTRPCContext({ headers });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.imageGallery.deleteFolderRecord({ id });

    // 2. Delete bucket from MinIO
    await deleteImageGalleryFolderBucket(result.folder.bucketName);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Image gallery folder deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Creates a new image file in a gallery folder
 * @description Uploads a single image file to MinIO and stores metadata in database via tRPC
 * @route POST /api/image-gallery/files
 * @param {Request} req - Express request object with file upload and folder ID
 * @param {Response<ApiResponse<CreateImageFileResponseType>>} res - Express response object
 * @returns {Promise<Response>} Success response with created file data
 * @throws {400} Bad Request - Missing file or invalid folder ID
 * @throws {404} Not Found - Folder does not exist
 * @throws {500} Internal Server Error - File upload or database failure
 */
export const createImageFileController = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file as CustomMulterFile;

    if (!file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "File is required",
      });
    }

    const { folderId } = req.body;

    const { data, success, error } = createImageFileSchema.safeParse({
      folderId,
      file,
    });

    if (!success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    // 1. Get folder info via tRPC to get bucketName
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      }
    }
    const ctx = await createTRPCContext({ headers });
    const caller = appRouter.createCaller(ctx);

    const folderResult = await caller.imageGallery.getFolderById({
      id: folderId,
    });

    // 2. Upload file to MinIO
    const fileData = await uploadImageFile({
      file: data.file,
      bucketName: folderResult.folder.bucketName,
    });

    // 3. Create database record via tRPC
    const result = await caller.imageGallery.createFileRecord({
      fileName: fileData.fileName,
      originalName: fileData.originalName,
      size: fileData.size,
      mimeType: fileData.mimeType,
      bucketName: folderResult.folder.bucketName,
      folderId: folderId,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Image file created successfully",
      data: { file: result.file },
    });
  } catch (error) {
    console.error("Error creating file:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Creates multiple image files in a gallery folder
 * @description Uploads multiple image files to MinIO and stores metadata in database via tRPC
 * @route POST /api/image-gallery/files/multiple
 * @param {Request} req - Express request object with multiple file uploads and folder ID
 * @param {Response<ApiResponse<CreateMultipleImageFileResponseType>>} res - Express response object
 * @returns {Promise<Response>} Success response with array of created file data
 * @throws {400} Bad Request - Missing files or invalid folder ID
 * @throws {404} Not Found - Folder does not exist
 * @throws {500} Internal Server Error - File upload or database failure
 */
export const createMultipleImageFilesController = async (
  req: Request,
  res: Response
) => {
  try {
    const files = req.files as CustomMulterFile[];

    if (!files || files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Files are required",
      });
    }

    const { folderId } = req.body;

    // Validate all files first before processing any
    const validationResults = files.map((file) => {
      return createImageFileSchema.safeParse({
        folderId,
        file,
      });
    });

    // Check if any validation failed
    const firstError = validationResults.find((result) => !result.success);
    if (firstError && !firstError.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation error",
        errors: firstError.error.errors,
      });
    }

    // 1. Get folder info via tRPC to get bucketName
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      }
    }
    const ctx = await createTRPCContext({ headers });
    const caller = appRouter.createCaller(ctx);

    const folderResult = await caller.imageGallery.getFolderById({
      id: folderId,
    });

    // 2. Process all files
    const imageFiles = await Promise.all(
      validationResults.map(async (result) => {
        if (result.success) {
          // Upload file to MinIO
          const fileData = await uploadImageFile({
            file: result.data.file,
            bucketName: folderResult.folder.bucketName,
          });

          // Create database record via tRPC
          const fileResult = await caller.imageGallery.createFileRecord({
            fileName: fileData.fileName,
            originalName: fileData.originalName,
            size: fileData.size,
            mimeType: fileData.mimeType,
            bucketName: folderResult.folder.bucketName,
            folderId: folderId,
          });

          return fileResult.file;
        }
        // This should never happen since we checked above, but TypeScript needs it
        throw new Error("Validation failed");
      })
    );

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Image files created successfully",
      data: { files: imageFiles },
    });
  } catch (error) {
    console.error("Error creating files:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Removed getImageFilesByFolderIdController - now handled by tRPC

// Removed getImageFileByIdController - now handled by tRPC

/**
 * Deletes an image file
 * @description Removes an image file from database via tRPC and then from MinIO storage
 * @route DELETE /api/image-gallery/files/:id
 * @param {Request} req - Express request object with file ID in params
 * @param {Response<ApiResponse>} res - Express response object
 * @returns {Promise<Response>} Success response confirming deletion
 * @throws {400} Bad Request - Invalid file ID
 * @throws {404} Not Found - File does not exist
 * @throws {500} Internal Server Error - File deletion or database failure
 */
export const deleteImageFileController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { success, error } = deleteImageFileSchema.safeParse({ id });

    if (!success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    // 1. Delete database record via tRPC (this returns the file with bucketName and fileName)
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      }
    }
    const ctx = await createTRPCContext({ headers });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.imageGallery.deleteFileRecord({ id });

    // 2. Delete file from MinIO storage
    await deleteImageFileFromStorage(
      result.file.bucketName,
      result.file.fileName
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Image file deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Retrieves a presigned URL for an image file
 * @description Generates a temporary URL for accessing an image file from storage
 * @route GET /api/image-gallery/files/:id/url
 * @param {Request} req - Express request object with file ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Success response with presigned URL
 * @throws {400} Bad Request - Invalid file ID
 * @throws {404} Not Found - File does not exist
 * @throws {500} Internal Server Error - URL generation failure
 */
export const getImageFileUrlController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { success, error } = getImageFileUrlSchema.safeParse({ id });

    if (!success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    const url = await getImageFileUrl(id);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Image file URL retrieved successfully",
      data: { url },
    });
  } catch (error) {
    console.error("Error getting image file URL:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};