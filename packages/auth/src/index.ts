import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { expo } from "@better-auth/expo";

import { prisma } from "@workspace/db";

const allOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "/api/v1/auth",
  trustedOrigins: allOrigins,
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookies: {
      sessionToken: {
        name: "session_token",
        attributes: {
          httpOnly: true,
          secure: true,
        },
      },
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
    },
    cookiePrefix: "st_",
  },
  onAPIError: {
    throw: true,
    onError: (error, ctx) => {
      console.log("Auth error", error);
    },
    errorURL: "/api/v1/auth/error",
  },
  plugins: [openAPI({}), expo()],
});

export type Auth = typeof auth;
export type Session = Auth["$Infer"]["Session"];
