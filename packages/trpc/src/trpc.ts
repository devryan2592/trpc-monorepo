import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import SuperJSON from "superjson";
import { Context } from "./context.js";
import { z, ZodError } from "zod/v4";

export const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
            : null,
      },
    };
  },
});

// Auth middleware: ensures a session exists
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Forward the existing context; session is known to be non-null here
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const router = t.router;
export const procedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuthed);
