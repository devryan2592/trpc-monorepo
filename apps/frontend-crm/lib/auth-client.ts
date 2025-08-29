import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: "http://localhost:8000",
    basePath: "/api/v1/auth",
    plugins: [],
    fetchOptions: {
      credentials: "include",
    },
  }
);
