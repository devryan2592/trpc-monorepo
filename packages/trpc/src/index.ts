export {
  createTRPCContext,
  createExpressTRPCContext,
  type Context,
  type ExpressContext,
} from "./context";
export { appRouter, type AppRouter } from "./routers";
export { trpcExpressMiddleware } from "./server";

// Destination exports
export {
  createDestinationSchema,
  updateDestinationSchema,
  getDestinationByIdSchema,
  deleteDestinationSchema,
  getAllDestinationsSchema,
  type CreateDestinationInput,
  type UpdateDestinationInput,
  type GetDestinationByIdInput,
  type DeleteDestinationInput,
  type GetAllDestinationsInput,
} from "./schemas/destination.schema";

export {
  createDestinationService,
  type DestinationWithImageURLs,
} from "./services/destination.service";
