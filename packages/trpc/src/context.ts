import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

import type { Session } from "@workspace/auth";
import { auth } from "@workspace/auth";
import { prisma } from "@workspace/db";

type BaseContextOptions = {
  headers: Headers;
};

// Define explicit types to avoid complex inferred types
type TRPCContext = {
  session: Session | null;
  prisma: typeof prisma;
};

export const createTRPCContext = async (
  opts: BaseContextOptions
): Promise<TRPCContext> => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });
  return {
    session,
    prisma,
  };
};

export const createExpressTRPCContext = async (
  opts: CreateExpressContextOptions
) => {
  console.log("opts.req.headers", opts.req.headers);
  const headers = new Headers();
  for (const [key, value] of Object.entries(opts.req.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  return createTRPCContext({
    headers,
  });
};

export type Context = TRPCContext;
export type ExpressContext = TRPCContext & { req: Request; res: Response };
