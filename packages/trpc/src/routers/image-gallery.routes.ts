import { procedure, router } from "../trpc";
import {
  createFolderRecordSchema,
  createFileRecordSchema,
  folderIdSchema,
  fileIdSchema,
} from "../schemas/image-gallery.schema";
import { createImageGalleryService } from "../services/image-gallery.service";

export const imageGalleryRouter = router({
  // GET Operations - Used by frontend
  
  /**
   * Get all image gallery folders with their files
   */
  getFolders: procedure.query(async ({ ctx }) => {
    const service = createImageGalleryService(ctx.prisma);
    return service.getFolders();
  }),

  /**
   * Get a specific folder by ID with its files
   */
  getFolderById: procedure
    .input(folderIdSchema)
    .query(async ({ ctx, input }) => {
      const service = createImageGalleryService(ctx.prisma);
      return service.getFolderById(input);
    }),

  /**
   * Get all files in a specific folder
   */
  getFilesByFolderId: procedure
    .input(folderIdSchema)
    .query(async ({ ctx, input }) => {
      const service = createImageGalleryService(ctx.prisma);
      return service.getFilesByFolderId(input);
    }),

  /**
   * Get a specific file by ID
   */
  getFileById: procedure
    .input(fileIdSchema)
    .query(async ({ ctx, input }) => {
      const service = createImageGalleryService(ctx.prisma);
      return service.getFileById(input);
    }),

  // Database Record Operations - Used by backend REST API

  /**
   * Create folder record in database (called after bucket creation)
   */
  createFolderRecord: procedure
    .input(createFolderRecordSchema)
    .mutation(async ({ ctx, input }) => {
      const service = createImageGalleryService(ctx.prisma);
      return service.createFolderRecord(input);
    }),

  /**
   * Create file record in database (called after file upload)
   */
  createFileRecord: procedure
    .input(createFileRecordSchema)
    .mutation(async ({ ctx, input }) => {
      const service = createImageGalleryService(ctx.prisma);
      return service.createFileRecord(input);
    }),

  /**
   * Delete folder record from database (called before bucket deletion)
   */
  deleteFolderRecord: procedure
    .input(folderIdSchema)
    .mutation(async ({ ctx, input }) => {
      const service = createImageGalleryService(ctx.prisma);
      return service.deleteFolderRecord(input);
    }),

  /**
   * Delete file record from database (called before file deletion)
   */
  deleteFileRecord: procedure
    .input(fileIdSchema)
    .mutation(async ({ ctx, input }) => {
      const service = createImageGalleryService(ctx.prisma);
      return service.deleteFileRecord(input);
    }),
});