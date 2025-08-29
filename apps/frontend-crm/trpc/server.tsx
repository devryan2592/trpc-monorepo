"server only";

import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { headers as nextHeaders } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import type { AppRouter } from "@workspace/trpc";
import superjson from "superjson";

import { makeQueryClient } from "./query-client";
import { createTRPCClient, httpLink } from "@trpc/client";

export const getQueryClient = cache(makeQueryClient);

export const trpc: ReturnType<typeof createTRPCOptionsProxy<AppRouter>> =
  createTRPCOptionsProxy<AppRouter>({
    client: createTRPCClient({
      links: [
        httpLink({
          url: "http://localhost:8000/api/v1/trpc",
          transformer: superjson,
          headers: async () => {
            const headers = new Headers(await nextHeaders());
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
    }),
    queryClient: getQueryClient,
  });

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}
