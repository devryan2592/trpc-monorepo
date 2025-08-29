import { t } from "../trpc";
import { testRouter } from "./test.routes";
import { userRouter } from "./user.routes";
import { imageGalleryRouter } from "./image-gallery.routes";

export const appRouter = t.router({
  test: testRouter,
  user: userRouter,
  imageGallery: imageGalleryRouter,
});

export type AppRouter = typeof appRouter;
