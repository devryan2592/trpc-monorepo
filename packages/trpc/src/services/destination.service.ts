import { TRPCError } from "@trpc/server";
import { PrismaClient, Destination, Image, City, FAQ } from "@workspace/db/src/generated/prisma";
import {
  CreateDestinationInput,
  UpdateDestinationInput,
  GetDestinationByIdInput,
  DeleteDestinationInput,
  GetAllDestinationsInput,
} from "../schemas/destination.schema";

// Types for destination with relations
type DestinationWithRelations = Destination & {
  cities: City[];
  thumbnail?: Image | null;
  images?: Image[];
  faqs?: FAQ[];
};

// Custom Destination Type with Image URLs
type DestinationWithImageURLs = {
  id: string;
  name: string;
  slug: string;
  content?: string | null;
  featured: boolean;
  currency?: string | null;
  bestSeasonStart?: string | null;
  bestSeasonEnd?: string | null;
  languages?: string[];
  cities?: {
    id: string;
    name: string;
    slug: string;
  }[];
  thumbnail?: {
    id: string;
    fileName?: string | null;
    bucketName?: string | null;
    altText?: string | null;
    url?: string | null;
  };
  images?: {
    id: string;
    fileName?: string | null;
    bucketName?: string | null;
    altText?: string | null;
    url?: string | null;
  }[];
  faqs?: {
    id: string;
    question: string | null;
    answer: string | null;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Utility function to create a slug from a string
 * @param text - The text to convert to slug
 * @returns Slugified string
 */
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Service class for destination operations
 * @description Handles all business logic for destination management
 */
export class DestinationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Checks if a slug is unique and generates a unique one if needed
   * @param slug - The slug to check for uniqueness
   * @returns A unique slug
   */
  private async checkAndReplaceSlug(slug: string): Promise<string> {
    try {
      let finalSlug = slug;
      let counter = 1;

      while (true) {
        const existingDestination = await this.prisma.destination.findUnique({
          where: {
            slug: finalSlug,
          },
        });

        if (!existingDestination) {
          break;
        }

        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      return finalSlug;
    } catch (error) {
      console.error("Error checking slug uniqueness: ", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate unique slug",
      });
    }
  }

  /**
   * Transforms DestinationWithRelations to DestinationWithImageURLs
   * Note: In tRPC context, we'll return the data as-is since URL generation
   * would typically be handled by a separate service or in the frontend
   * @param destination - The destination with database relations
   * @returns The destination with processed data
   */
  private async transformDestinationToImageURLs(
    destination: DestinationWithRelations
  ): Promise<DestinationWithImageURLs> {
    try {
      // For now, we'll return the data structure without actual URL generation
      // In a real implementation, you would integrate with your file storage service
      let thumbnail: DestinationWithImageURLs["thumbnail"] = undefined;

      if (destination.thumbnailId && destination.thumbnail) {
        thumbnail = {
          ...destination.thumbnail,
          url: ``, // URL generation would be implemented here
        };
      }

      let images: DestinationWithImageURLs["images"] = [];

      if (destination.images && destination.images.length > 0) {
        images = destination.images.map((image) => ({
          ...image,
          url: ``, // URL generation would be implemented here
        }));
      }

      return {
        ...destination,
        thumbnail,
        images,
      };
    } catch (error) {
      console.error("Error transforming destination to image URLs: ", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process destination data",
      });
    }
  }

  /**
   * Creates a new destination with associated resources
   * @param data - The destination creation data
   * @returns The created destination with image URLs
   */
  async createDestination(data: CreateDestinationInput): Promise<DestinationWithImageURLs> {
    try {
      // Check if destination already exists
      const existingDestination = await this.prisma.destination.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: 'insensitive',
          },
        },
      });

      if (existingDestination) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Destination with name '${data.name}' already exists`,
        });
      }

      // Generate unique slug
      const finalSlug = await this.checkAndReplaceSlug(createSlug(data.name));

      let thumbnailId: string | undefined;

      if (data.thumbnail) {
        try {
          const thumbnail = await this.prisma.image.create({
            data: {
              bucketName: data.thumbnail.bucketName,
              fileName: data.thumbnail.fileName,
              altText: data.thumbnail.altText,
            },
          });

          thumbnailId = thumbnail.id;
        } catch (imageError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create thumbnail image",
          });
        }
      }

      const destination = await this.prisma.destination.create({
        data: {
          name: data.name,
          slug: finalSlug,
          content: data.content,
          featured: data.featured ?? false,
          currency: data.currency,
          bestSeasonStart: data.bestSeasonStart,
          bestSeasonEnd: data.bestSeasonEnd,
          languages: data.languages,
          faqs:
            data.faqs && data.faqs.length > 0
              ? {
                  create: data.faqs.map((faq) => ({
                    question: faq.question,
                    answer: faq.answer,
                  })),
                }
              : {
                  create: [],
                },
          thumbnailId,
          cities: data.cities?.length
            ? {
                create: data.cities.map((city) => ({
                  name: city.name,
                  slug: city.slug ?? createSlug(city.name),
                })),
              }
            : undefined,
          ...(data.images &&
            data.images.length > 0 && {
              images: {
                create: data.images.map((image) => ({
                  bucketName: image.bucketName,
                  fileName: image.fileName,
                  altText: image.altText,
                })),
              },
            }),
        },
        include: {
          thumbnail: true,
          images: true,
          faqs: true,
          cities: true,
        },
      });

      return this.transformDestinationToImageURLs(destination);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error("Error creating destination: ", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create destination",
      });
    }
  }

  /**
   * Updates an existing destination
   * @param data - The destination update data
   * @returns The updated destination with image URLs
   */
  async updateDestination(data: UpdateDestinationInput): Promise<DestinationWithImageURLs> {
    try {
      // Get current destination
      const currentDestination = await this.prisma.destination.findUnique({
        where: { id: data.id },
        include: {
          thumbnail: true,
          images: true,
          faqs: true,
          cities: true,
        },
      });

      if (!currentDestination) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destination not found",
        });
      }

      // If name is updated, check and replace slug
      let finalSlug = currentDestination.slug;
      if (data.name && data.name !== currentDestination.name) {
        finalSlug = await this.checkAndReplaceSlug(createSlug(data.name));
      }

      // Prepare update data
      const updateData: any = {
        ...(data.name && { name: data.name }),
        ...(finalSlug && { slug: finalSlug }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.bestSeasonStart !== undefined && {
          bestSeasonStart: data.bestSeasonStart,
        }),
        ...(data.bestSeasonEnd !== undefined && {
          bestSeasonEnd: data.bestSeasonEnd,
        }),
        ...(data.languages !== undefined && {
          languages: data.languages,
        }),

        ...(data.faqs && {
          faqs: {
            // Delete all existing FAQs and create new ones
            deleteMany: {},
            create: data.faqs.map((faq) => ({
              question: faq.question,
              answer: faq.answer,
            })),
          },
        }),
      };

      // Handle thumbnail update
      if (data.thumbnail) {
        if (currentDestination.thumbnailId) {
          // Update existing thumbnail
          updateData.thumbnail = {
            update: {
              bucketName: data.thumbnail.bucketName || "",
              fileName: data.thumbnail.fileName || "",
              altText: data.thumbnail.altText,
            },
          };
        } else {
          // Create new thumbnail
          updateData.thumbnail = {
            create: {
              bucketName: data.thumbnail.bucketName || "",
              fileName: data.thumbnail.fileName || "",
              altText: data.thumbnail.altText,
            },
          };
        }
      } else if (
        Object.prototype.hasOwnProperty.call(data, "thumbnail") &&
        (data.thumbnail === null || data.thumbnail === undefined) &&
        currentDestination.thumbnailId
      ) {
        // Delete existing thumbnail when thumbnail field is explicitly included and set to null or undefined
        updateData.thumbnail = {
          delete: true,
        };
      }

      // Handle images update
      if (data.images) {
        // Delete existing images and create new ones
        updateData.images = {
          deleteMany: {},
          create: data.images.map((image) => ({
            bucketName: image.bucketName || "",
            fileName: image.fileName || "",
            altText: image.altText,
          })),
        };
      }

      let citiesToDelete: City[] = [];
      let citiesToUpdate: { id: string; name: string; slug: string }[] = [];
      let citiesToCreate: { name: string; slug: string }[] = [];

      // Handle cities update - check if cities field is provided in the request
      if (data.hasOwnProperty("cities")) {
        if (data.cities && data.cities.length > 0) {
          // Cities are provided, handle update/create/delete logic
          citiesToDelete =
            currentDestination.cities?.filter(
              (city) => !data.cities?.some((newCity) => newCity.id === city.id)
            ) || [];

          citiesToUpdate = data.cities
            .filter((city) => city.id && city.id !== "")
            .map(
              (city) =>
                city.id && {
                  id: city.id!,
                  name: city.name ?? "",
                  slug: city.slug ?? createSlug(city.name ?? ""),
                }
            )
            .filter(
              (city): city is { id: string; name: string; slug: string } =>
                city !== null
            );

          //  If no ID in data or Id is "", create new cities
          citiesToCreate = data.cities
            .filter((city) => !city.id || city.id === "")
            .map((city) => ({
              name: city.name ?? "",
              slug: city.slug ?? createSlug(city.name ?? ""),
            }));
        } else {
          // Empty array or null/undefined - delete all existing cities
          citiesToDelete = currentDestination.cities || [];
        }
      }

      if (
        citiesToDelete.length > 0 ||
        citiesToCreate.length > 0 ||
        citiesToUpdate.length > 0
      ) {
        updateData.cities = {
          ...(citiesToDelete.length > 0 && {
            deleteMany: {
              id: {
                in: citiesToDelete.map((city) => city.id),
              },
            },
          }),
          ...(citiesToCreate.length > 0 && {
            create: citiesToCreate,
          }),
          ...(citiesToUpdate.length > 0 && {
            updateMany: citiesToUpdate.map((city) => ({
              where: { id: city.id },
              data: { name: city.name, slug: city.slug },
            })),
          }),
        };
      }

      const destination = await this.prisma.destination.update({
        where: {
          id: data.id,
        },
        data: updateData,
        include: {
          thumbnail: true,
          images: true,
          faqs: true,
          cities: true,
        },
      });

      return this.transformDestinationToImageURLs(destination);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error("Error updating destination: ", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update destination",
      });
    }
  }

  /**
   * Deletes a destination
   * @param input - The destination deletion input
   * @returns Success message
   */
  async deleteDestination(input: DeleteDestinationInput) {
    try {
      await this.prisma.destination.delete({
        where: { id: input.id },
      });

      return { message: "Destination deleted successfully" };
    } catch (error) {
      console.error("Error deleting destination:", error);
      if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destination not found",
        });
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete destination",
      });
    }
  }

  /**
   * Gets all destinations with optional search
   * @param input - The search input
   * @returns All destinations with image URLs
   */
  async getAllDestinations(input: GetAllDestinationsInput) {
    try {
      const query = input.q || "";

      const destinations = await this.prisma.destination.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          thumbnail: true,
          images: true,
          faqs: true,
          cities: true,
        },
      });

      // Return All destinations with image URLs
      const destinationsWithImageURLs = await Promise.all(
        destinations.map(async (destination) => {
          return this.transformDestinationToImageURLs(destination);
        })
      );

      return destinationsWithImageURLs;
    } catch (error) {
      console.error("Error getting all destinations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve destinations",
      });
    }
  }

  /**
   * Gets a destination by ID
   * @param input - The destination ID input
   * @returns The destination with image URLs
   */
  async getDestinationById(input: GetDestinationByIdInput): Promise<DestinationWithImageURLs> {
    try {
      const destination = await this.prisma.destination.findUnique({
        where: { id: input.id },
        include: {
          thumbnail: true,
          images: true,
          faqs: true,
          cities: true,
        },
      });

      if (!destination) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destination not found",
        });
      }

      return this.transformDestinationToImageURLs(destination);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error("Error getting destination by ID:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve destination",
      });
    }
  }
}

/**
 * Factory function to create DestinationService instance
 * @param prisma - Prisma client instance
 * @returns DestinationService instance
 */
export const createDestinationService = (prisma: PrismaClient) => {
  return new DestinationService(prisma);
};