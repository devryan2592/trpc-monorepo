"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, createTRPCClient, loggerLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@workspace/trpc";
import { makeQueryClient } from "./query-client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

let clientQueryClientSingleton: QueryClient | undefined = undefined;

const trpcContext: ReturnType<typeof createTRPCContext<AppRouter>> =
  createTRPCContext<AppRouter>();
export const TRPCProvider: typeof trpcContext.TRPCProvider =
  trpcContext.TRPCProvider;
export const useTRPC: typeof trpcContext.useTRPC = trpcContext.useTRPC;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "http://localhost:8000/api/v1/trpc",
          transformer: superjson,
          headers() {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              credentials: "include",
              headers: {
                ...options?.headers,
                "x-trpc-source": "nextjs-react",
              },
            });
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
