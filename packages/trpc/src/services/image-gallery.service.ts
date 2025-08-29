import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@workspace/db/src/generated/prisma";
import {
  CreateFolderRecordInput,
  CreateFileRecordInput,
  FolderIdInput,
  FileIdInput,
} from "../schemas/image-gallery.schema";

/**
 * Service class for image gallery operations
 * @description Handles all business logic for image gallery folders and files
 */
export class ImageGalleryService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all image gallery folders with their files
   * @returns Promise with folders data
   */
  async getFolders() {
    try {
      const folders = await this.prisma.imageGalleryFolder.findMany({
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
  }

  /**
   * Get a specific folder by ID with its files
   * @param input - Folder ID input
   * @returns Promise with folder data
   */
  async getFolderById(input: FolderIdInput) {
    try {
      const folder = await this.prisma.imageGalleryFolder.findUnique({
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
  }

  /**
   * Get all files in a specific folder
   * @param input - Folder ID input
   * @returns Promise with folder and files data
   */
  async getFilesByFolderId(input: FolderIdInput) {
    try {
      // First verify the folder exists
      const folder = await this.prisma.imageGalleryFolder.findUnique({
        where: { id: input.id },
      });

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }

      // Get the files in the folder
      const files = await this.prisma.imageGalleryFile.findMany({
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
  }

  /**
   * Get a specific file by ID
   * @param input - File ID input
   * @returns Promise with file data
   */
  async getFileById(input: FileIdInput) {
    try {
      const file = await this.prisma.imageGalleryFile.findUnique({
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
  }

  /**
   * Create folder record in database (called after bucket creation)
   * @param input - Folder creation input
   * @returns Promise with created folder data
   */
  async createFolderRecord(input: CreateFolderRecordInput) {
    try {
      const folder = await this.prisma.imageGalleryFolder.create({
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
  }

  /**
   * Create file record in database (called after file upload)
   * @param input - File creation input
   * @returns Promise with created file data
   */
  async createFileRecord(input: CreateFileRecordInput) {
    try {
      // Verify folder exists
      const folder = await this.prisma.imageGalleryFolder.findUnique({
        where: { id: input.folderId },
      });

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }

      const file = await this.prisma.imageGalleryFile.create({
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
  }

  /**
   * Delete folder record from database (called before bucket deletion)
   * @param input - Folder ID input
   * @returns Promise with deleted folder data
   */
  async deleteFolderRecord(input: FolderIdInput) {
    try {
      const folder = await this.prisma.imageGalleryFolder.delete({
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
  }

  /**
   * Delete file record from database (called before file deletion)
   * @param input - File ID input
   * @returns Promise with deleted file data
   */
  async deleteFileRecord(input: FileIdInput) {
    try {
      const file = await this.prisma.imageGalleryFile.delete({
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
  }
}

/**
 * Factory function to create ImageGalleryService instance
 * @param prisma - Prisma client instance
 * @returns ImageGalleryService instance
 */
export const createImageGalleryService = (prisma: PrismaClient) => {
  return new ImageGalleryService(prisma);
};