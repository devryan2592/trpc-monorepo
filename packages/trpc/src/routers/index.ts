import { t } from "../trpc";
import { testRouter } from "./test.routes";
import { userRouter } from "./user.routes";
import { imageGalleryRouter } from "./image-gallery.routes";
import { destinationRouter } from "./destination.routes";

export const appRouter = t.router({
  test: testRouter,
  user: userRouter,
  imageGallery: imageGalleryRouter,
  destination: destinationRouter,
});

export type AppRouter = typeof appRouter;
