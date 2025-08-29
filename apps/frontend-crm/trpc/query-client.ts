import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import superjson from "superjson";

export const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) => {
          return (
            defaultShouldDehydrateQuery(query) ||
            query.state.status === "pending"
          );
        },
        shouldRedactErrors: () => {
          return false;
        },
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
};
