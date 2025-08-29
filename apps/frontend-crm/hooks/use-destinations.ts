"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  CreateDestinationInput,
  UpdateDestinationInput,
  GetDestinationByIdInput,
  DeleteDestinationInput,
  GetAllDestinationsInput,
} from "@workspace/trpc";
import {
  CreateDestinationMutationData,
  UpdateDestinationMutationData,
  DeleteDestinationMutationData,
  Destination,
} from "@/types/destination";
import { toast } from "sonner";

/**
 * Hook to fetch all destinations with optional search
 * @param searchQuery - Optional search query to filter destinations
 * @returns Query result with destinations data, loading state, and error
 */
export function useDestinations(searchQuery?: string) {
  const trpc = useTRPC();

  const input: GetAllDestinationsInput = {
    q: searchQuery || undefined,
  };

  return useQuery(
    trpc.destination.getAllDestinations.queryOptions(input)
  );
}

/**
 * Hook to fetch a single destination by ID
 * @param id - Destination ID
 * @param enabled - Whether the query should be enabled
 * @returns Query result with destination data, loading state, and error
 */
export function useDestination(id: string, enabled: boolean = true) {
  const trpc = useTRPC();

  const input: GetDestinationByIdInput = { id };

  return useQuery(
    trpc.destination.getDestinationById.queryOptions(input, {
      enabled: enabled && !!id,
    })
  );
}

/**
 * Hook to create a new destination
 * @returns Mutation object for creating destinations
 */
export function useCreateDestination() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDestinationInput) => {
      const result = await trpc.destination.createDestination.mutate(data);
      return result;
    },
    onSuccess: (data) => {
      // Invalidate and refetch destinations list
      queryClient.invalidateQueries({
        queryKey: trpc.destination.getAllDestinations.queryKey({}),
      });
      
      // Invalidate search queries
      queryClient.invalidateQueries({
        queryKey: trpc.destination.searchDestinations.queryKey({}),
      });

      toast.success("Destination created successfully");
    },
    onError: (error: any) => {
      console.error("Error creating destination:", error);
      toast.error(
        error?.message || "Failed to create destination. Please try again."
      );
    },
  });
}

/**
 * Hook to update an existing destination
 * @returns Mutation object for updating destinations
 */
export function useUpdateDestination() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateDestinationMutationData) => {
      const updateData: UpdateDestinationInput = {
        id,
        ...data,
      };
      const result = await trpc.destination.updateDestination.mutate(updateData);
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch destinations list
      queryClient.invalidateQueries({
        queryKey: trpc.destination.getAllDestinations.queryKey({}),
      });
      
      // Invalidate search queries
      queryClient.invalidateQueries({
        queryKey: trpc.destination.searchDestinations.queryKey({}),
      });

      // Invalidate specific destination query
      queryClient.invalidateQueries({
        queryKey: trpc.destination.getDestinationById.queryKey({ id: variables.id }),
      });

      toast.success("Destination updated successfully");
    },
    onError: (error: any) => {
      console.error("Error updating destination:", error);
      toast.error(
        error?.message || "Failed to update destination. Please try again."
      );
    },
  });
}

/**
 * Hook to delete a destination
 * @returns Mutation object for deleting destinations
 */
export function useDeleteDestination() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteDestinationMutationData) => {
      const input: DeleteDestinationInput = { id };
      const result = await trpc.destination.deleteDestination.mutate(input);
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch destinations list
      queryClient.invalidateQueries({
        queryKey: trpc.destination.getAllDestinations.queryKey({}),
      });
      
      // Invalidate search queries
      queryClient.invalidateQueries({
        queryKey: trpc.destination.searchDestinations.queryKey({}),
      });

      // Remove specific destination from cache
      queryClient.removeQueries({
        queryKey: trpc.destination.getDestinationById.queryKey({ id: variables.id }),
      });

      toast.success("Destination deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting destination:", error);
      toast.error(
        error?.message || "Failed to delete destination. Please try again."
      );
    },
  });
}

/**
 * Hook to search destinations
 * @param searchQuery - Search query string
 * @returns Query result with filtered destinations
 */
export function useSearchDestinations(searchQuery: string) {
  const trpc = useTRPC();

  const input: GetAllDestinationsInput = {
    q: searchQuery,
  };

  return useQuery(
    trpc.destination.searchDestinations.queryOptions(input, {
      enabled: !!searchQuery.trim(),
    })
  );
}

/**
 * Hook to prefetch destinations for better UX
 * @param searchQuery - Optional search query
 */
export function usePrefetchDestinations(searchQuery?: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const prefetchDestinations = () => {
    const input: GetAllDestinationsInput = {
      q: searchQuery || undefined,
    };

    queryClient.prefetchQuery(
      trpc.destination.getAllDestinations.queryOptions(input)
    );
  };

  return { prefetchDestinations };
}

/**
 * Hook to get optimistic updates for destinations
 * Useful for immediate UI feedback before server response
 */
export function useOptimisticDestinations() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const addOptimisticDestination = (destination: Partial<Destination>) => {
    queryClient.setQueryData(
      trpc.destination.getAllDestinations.queryKey({}),
      (old: any) => {
        if (!old) return old;
        return {
          ...old,
          destinations: [destination, ...old.destinations],
        };
      }
    );
  };

  const removeOptimisticDestination = (id: string) => {
    queryClient.setQueryData(
      trpc.destination.getAllDestinations.queryKey({}),
      (old: any) => {
        if (!old) return old;
        return {
          ...old,
          destinations: old.destinations.filter((dest: Destination) => dest.id !== id),
        };
      }
    );
  };

  const updateOptimisticDestination = (id: string, updates: Partial<Destination>) => {
    queryClient.setQueryData(
      trpc.destination.getAllDestinations.queryKey({}),
      (old: any) => {
        if (!old) return old;
        return {
          ...old,
          destinations: old.destinations.map((dest: Destination) =>
            dest.id === id ? { ...dest, ...updates } : dest
          ),
        };
      }
    );
  };

  return {
    addOptimisticDestination,
    removeOptimisticDestination,
    updateOptimisticDestination,
  };
}