import { procedure, router } from "../trpc";
import {
  createDestinationSchema,
  updateDestinationSchema,
  getDestinationByIdSchema,
  deleteDestinationSchema,
  getAllDestinationsSchema,
} from "../schemas/destination.schema";
import { createDestinationService } from "../services/destination.service";

/**
 * Destination router with all destination-related procedures
 * @description Handles destination CRUD operations and search functionality
 */
export const destinationRouter = router({
  /**
   * Creates a new destination
   * @description Creates a new destination with associated cities, images, and FAQs
   * @input CreateDestinationInput - Destination creation data
   * @returns Created destination with image URLs
   * @throws CONFLICT - Destination already exists
   * @throws INTERNAL_SERVER_ERROR - Database or file operation failure
   */
  createDestination: procedure
    .input(createDestinationSchema)
    .mutation(async ({ ctx, input }) => {
      const service = createDestinationService(ctx.prisma);
      const destination = await service.createDestination(input);
      return { destination };
    }),

  /**
   * Updates an existing destination
   * @description Updates destination information including cities, images, and FAQs
   * @input UpdateDestinationInput - Destination update data with ID
   * @returns Updated destination with image URLs
   * @throws NOT_FOUND - Destination does not exist
   * @throws INTERNAL_SERVER_ERROR - Database or file operation failure
   */
  updateDestination: procedure
    .input(updateDestinationSchema)
    .mutation(async ({ ctx, input }) => {
      const service = createDestinationService(ctx.prisma);
      const destination = await service.updateDestination(input);
      return { destination };
    }),

  /**
   * Deletes a destination
   * @description Removes a destination and all associated data from the database
   * @input DeleteDestinationInput - Destination ID
   * @returns Success message confirming deletion
   * @throws NOT_FOUND - Destination does not exist
   * @throws INTERNAL_SERVER_ERROR - Database operation failure
   */
  deleteDestination: procedure
    .input(deleteDestinationSchema)
    .mutation(async ({ ctx, input }) => {
      const service = createDestinationService(ctx.prisma);
      const result = await service.deleteDestination(input);
      return result;
    }),

  /**
   * Retrieves all destinations
   * @description Fetches all destinations with optional search functionality
   * @input GetAllDestinationsInput - Optional search query
   * @returns Array of destinations with image URLs
   * @throws INTERNAL_SERVER_ERROR - Database query failure
   */
  getAllDestinations: procedure
    .input(getAllDestinationsSchema)
    .query(async ({ ctx, input }) => {
      const service = createDestinationService(ctx.prisma);
      const destinations = await service.getAllDestinations(input);
      return { destinations };
    }),

  /**
   * Retrieves a specific destination by ID
   * @description Fetches a single destination by its unique identifier including all associated data
   * @input GetDestinationByIdInput - Destination ID
   * @returns Destination with image URLs and all related data
   * @throws NOT_FOUND - Destination does not exist
   * @throws INTERNAL_SERVER_ERROR - Database query failure
   */
  getDestinationById: procedure
    .input(getDestinationByIdSchema)
    .query(async ({ ctx, input }) => {
      const service = createDestinationService(ctx.prisma);
      const destination = await service.getDestinationById(input);
      return { destination };
    }),

  /**
   * Get destinations with search functionality (alias for getAllDestinations)
   * @description Provides search functionality for destinations
   * @input GetAllDestinationsInput - Search query
   * @returns Filtered destinations based on search criteria
   * @throws INTERNAL_SERVER_ERROR - Database query failure
   */
  searchDestinations: procedure
    .input(getAllDestinationsSchema)
    .query(async ({ ctx, input }) => {
      const service = createDestinationService(ctx.prisma);
      const destinations = await service.getAllDestinations(input);
      return { destinations };
    }),
});