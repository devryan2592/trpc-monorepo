import { z } from "zod";
import { procedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

// Input schemas for tRPC procedures
const createFolderRecordSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  bucketName: z.string().min(1, "Bucket name is required"),
});

const createFileRecordSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  originalName: z.string().min(1, "Original name is required"),
  size: z.number().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
  bucketName: z.string().min(1, "Bucket name is required"),
  folderId: z.string().min(1, "Folder ID is required"),
});

const folderIdSchema = z.object({
  id: z.string().min(1, "Folder ID is required"),
});

const fileIdSchema = z.object({
  id: z.string().min(1, "File ID is required"),
});

export const imageGalleryRouter = router({
  // GET Operations - Used by frontend
  
  /**
   * Get all image gallery folders with their files
   */
  getFolders: procedure.query(async ({ ctx }) => {
    try {
      const folders = await ctx.prisma.imageGalleryFolder.findMany({
        include: {
          imageFiles: true,
        },
      });
      return { folders };
    } catch (error) {
      console.error("Error getting image gallery folders:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve folders",
      });
    }
  }),

  /**
   * Get a specific folder by ID with its files
   */
  getFolderById: procedure
    .input(folderIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const folder = await ctx.prisma.imageGalleryFolder.findUnique({
          where: { id: input.id },
          include: {
            imageFiles: true,
          },
        });

        if (!folder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Folder not found",
          });
        }

        return { folder };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error getting folder by ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve folder",
        });
      }
    }),

  /**
   * Get all files in a specific folder
   */
  getFilesByFolderId: procedure
    .input(folderIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        // First verify the folder exists
        const folder = await ctx.prisma.imageGalleryFolder.findUnique({
          where: { id: input.id },
        });

        if (!folder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Folder not found",
          });
        }

        // Get the files in the folder
        const files = await ctx.prisma.imageGalleryFile.findMany({
          where: { folderId: input.id },
          include: {
            folder: true,
          },
        });

        return { folder, files };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error getting files by folder ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve files",
        });
      }
    }),

  /**
   * Get a specific file by ID
   */
  getFileById: procedure
    .input(fileIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const file = await ctx.prisma.imageGalleryFile.findUnique({
          where: { id: input.id },
          include: {
            folder: true,
          },
        });

        if (!file) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found",
          });
        }

        return { file };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error getting file by ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve file",
        });
      }
    }),

  // Database Record Operations - Used by backend REST API

  /**
   * Create folder record in database (called after bucket creation)
   */
  createFolderRecord: procedure
    .input(createFolderRecordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const folder = await ctx.prisma.imageGalleryFolder.create({
          data: {
            name: input.name,
            bucketName: input.bucketName,
          },
        });
        return { folder };
      } catch (error) {
        console.error("Error creating folder record:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create folder record",
        });
      }
    }),

  /**
   * Create file record in database (called after file upload)
   */
  createFileRecord: procedure
    .input(createFileRecordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify folder exists
        const folder = await ctx.prisma.imageGalleryFolder.findUnique({
          where: { id: input.folderId },
        });

        if (!folder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Folder not found",
          });
        }

        const file = await ctx.prisma.imageGalleryFile.create({
          data: {
            fileName: input.fileName,
            originalName: input.originalName,
            size: input.size,
            mimeType: input.mimeType,
            bucketName: input.bucketName,
            folderId: input.folderId,
          },
          include: {
            folder: true,
          },
        });

        return { file };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error creating file record:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create file record",
        });
      }
    }),

  /**
   * Delete folder record from database (called before bucket deletion)
   */
  deleteFolderRecord: procedure
    .input(folderIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const folder = await ctx.prisma.imageGalleryFolder.delete({
          where: { id: input.id },
          include: {
            imageFiles: true,
          },
        });

        return { folder };
      } catch (error) {
        console.error("Error deleting folder record:", error);
        if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Folder not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete folder record",
        });
      }
    }),

  /**
   * Delete file record from database (called before file deletion)
   */
  deleteFileRecord: procedure
    .input(fileIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const file = await ctx.prisma.imageGalleryFile.delete({
          where: { id: input.id },
          include: {
            folder: true,
          },
        });

        return { file };
      } catch (error) {
        console.error("Error deleting file record:", error);
        if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file record",
        });
      }
    }),
});