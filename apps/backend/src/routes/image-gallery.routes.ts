import {
  createImageGalleryFolderController,
  deleteImageGalleryFolderController,
  createImageFileController,
  createMultipleImageFilesController,
  deleteImageFileController,
  getImageFileUrlController,
} from "../modules/image-gallery/controllers";
import { Router } from "express";
import { imageUpload } from "../utils/multer";
const router: Router = Router();

// Folder routes - only create and delete (GET operations handled by tRPC)
router.route("/folders").post(createImageGalleryFolderController);

router.route("/folders/:id").delete(deleteImageGalleryFolderController);

// Image file routes - only create and delete (GET operations handled by tRPC)
router
  .route("/files")
  .post(imageUpload.single("file"), createImageFileController);

router
  .route("/files/multiple")
  .post(imageUpload.array("files"), createMultipleImageFilesController);

router.route("/files/:id").delete(deleteImageFileController);

router.route("/files/:id/url").get(getImageFileUrlController);

export default router;
