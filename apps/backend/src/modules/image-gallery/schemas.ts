import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const ALL_ACCEPTED_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
];

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export const multerFileSchema = z
  .object({
    fieldname: z.string(),
    originalname: z.string().min(1, "Original filename is required"),
    encoding: z.string(),
    mimetype: z.string().refine((type) => ALL_ACCEPTED_TYPES.includes(type), {
      message:
        "File type not supported. Accepted types: images (JPEG, PNG, WebP, GIF), videos (MP4, MPEG, QuickTime, AVI, WebM), documents (PDF, Word, Excel, Text)",
    }),
    size: z.number().positive("File size must be positive"),
    destination: z.string(),
    filename: z.string(),
    path: z.string(),
  })
  .refine(
    (data) => {
      const mimetype = data.mimetype;
      const size = data.size;
      if (ACCEPTED_IMAGE_TYPES.includes(mimetype)) {
        return size <= MAX_IMAGE_SIZE;
      }
      if (ACCEPTED_VIDEO_TYPES.includes(mimetype)) {
        return size <= MAX_VIDEO_SIZE;
      }
      if (ACCEPTED_DOCUMENT_TYPES.includes(mimetype)) {
        return size <= MAX_DOCUMENT_SIZE;
      }
      return false;
    },
    {
      message: "File size exceeds the maximum allowed limit",
    }
  );

export type multerFile = z.infer<typeof multerFileSchema>;

// Export file type constants for use in other modules
export {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_DOCUMENT_TYPES,
  ALL_ACCEPTED_TYPES,
};

export const createImageGalleryFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(50, "Folder name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Folder name can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
});

export const deleteImageGalleryFolderSchema = z.object({
  folderId: z.string().min(1, "Folder id is required"),
});

export const getImageGalleryFolderSchema = z.object({
  folderId: z.string().min(1, "Folder id is required"),
});

export const createImageFileSchema = z.object({
  folderId: z.string().min(1, "Folder id is required"),
  file: multerFileSchema.refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.mimetype),
    {
      message: "Invalid file type",
    }
  ),
});

export const createMultipleImageFilesSchema = z.object({
  folderId: z.string().min(1, "Folder id is required"),
  files: z
    .array(multerFileSchema)
    .refine(
      (files) =>
        files.every((file) => ALL_ACCEPTED_TYPES.includes(file.mimetype)),
      {
        message: "Invalid file type",
      }
    ),
});

export const getImageFilesByFolderSchema = z.object({
  folderId: z.string().min(1, "Folder id is required"),
});

export const deleteImageFileSchema = z.object({
  id: z.string().min(1, "Image file id is required"),
});

export const getImageFileByIdSchema = z.object({
  id: z.string().min(1, "Image file id is required"),
});

export const getImageFileUrlSchema = z.object({
  id: z.string().min(1, "Image file id is required"),
});
