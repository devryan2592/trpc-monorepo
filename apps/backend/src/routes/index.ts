import { Router } from "express";

import imageGalleryRoutes from "./image-gallery.routes";

const router: Router = Router();

router.use("/image-gallery", imageGalleryRoutes);

export default router;
