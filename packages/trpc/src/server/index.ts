import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createExpressTRPCContext } from "../context";

export const trpcExpressMiddleware: ReturnType<typeof createExpressMiddleware> =
  createExpressMiddleware({
    router: appRouter,
    createContext: createExpressTRPCContext,
  });
