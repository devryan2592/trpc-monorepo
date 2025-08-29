import { z } from "zod";

/**
 * Schema for creating a folder record in the database
 * @description Validates folder creation data including name and bucket information
 */
export const createFolderRecordSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  bucketName: z.string().min(1, "Bucket name is required"),
});

/**
 * Schema for creating a file record in the database
 * @description Validates file creation data including file details and folder association
 */
export const createFileRecordSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  originalName: z.string().min(1, "Original name is required"),
  size: z.number().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
  bucketName: z.string().min(1, "Bucket name is required"),
  folderId: z.string().min(1, "Folder ID is required"),
});

/**
 * Schema for folder ID validation
 * @description Validates folder ID input for operations requiring folder identification
 */
export const folderIdSchema = z.object({
  id: z.string().min(1, "Folder ID is required"),
});

/**
 * Schema for file ID validation
 * @description Validates file ID input for operations requiring file identification
 */
export const fileIdSchema = z.object({
  id: z.string().min(1, "File ID is required"),
});

// Type exports for use in services and routes
export type CreateFolderRecordInput = z.infer<typeof createFolderRecordSchema>;
export type CreateFileRecordInput = z.infer<typeof createFileRecordSchema>;
export type FolderIdInput = z.infer<typeof folderIdSchema>;
export type FileIdInput = z.infer<typeof fileIdSchema>;