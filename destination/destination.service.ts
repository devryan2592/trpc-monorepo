import { prisma } from "@/config/db";
import { createSlug } from "@/utils/slug";
import {
  DestinationWithImageURLs,
  DestinationWithRelations,
} from "./destination.types";
import { City } from "@/generated/prisma";
import { getFileUrl } from "@/modules/minio/services";
import {
  DestinationNotFoundError,
  DatabaseOperationError,
  SlugGenerationError,
  DestinationAlreadyExistsError,
  FileOperationError,
  UrlGenerationError,
  ImageTransformationError,
} from "./errors";

/**
 * Checks if a slug is unique and generates a unique one if needed
 * @description Ensures slug uniqueness by appending a counter if the slug already exists
 * @param {string} slug - The slug to check for uniqueness
 * @returns {Promise<string>} A unique slug
 * @throws {DatabaseOperationError} When database query fails
 * @example
 * const uniqueSlug = await checkAndReplaceSlug("paris-france");
 */
const checkAndReplaceSlug = async (slug: string): Promise<string> => {
  try {
    let finalSlug = slug;
    let counter = 1;

    while (true) {
      const existingDestination = await prisma.destination.findUnique({
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
    throw new DatabaseOperationError("read", "destination slug", error as Error);
  }
};

/**
 * Transforms DestinationWithRelations to DestinationWithImageURLs
 * @description Converts destination data with file references to include actual file URLs
 * @param {DestinationWithRelations} destination - The destination with database relations
 * @returns {Promise<DestinationWithImageURLs>} The destination with generated image URLs
 * @throws {UrlGenerationError} When URL generation fails
 * @throws {ImageTransformationError} When image transformation fails
 * @example
 * const destinationWithUrls = await transformDestinationToImageURLs(destination);
 */
export const transformDestinationToImageURLs = async (
  destination: DestinationWithRelations
): Promise<DestinationWithImageURLs> => {
  try {
    // Transform thumbnail
    let thumbnail: DestinationWithImageURLs["thumbnail"] = undefined;

    if (destination.thumbnailId && destination.thumbnail) {
      try {
        const thumbnailUrl = await getFileUrl(
          destination.thumbnail.bucketName,
          destination.thumbnail.fileName
        );

        thumbnail = {
          ...destination.thumbnail,
          url: thumbnailUrl || "",
        };
      } catch (urlError) {
        throw new UrlGenerationError(
          destination.thumbnail.fileName,
          urlError as Error
        );
      }
    }

    let images: DestinationWithImageURLs["images"] = [];

    if (destination.images && destination.images.length > 0) {
      try {
        images = await Promise.all(
          destination.images.map(async (image) => {
            const url = await getFileUrl(image.bucketName, image.fileName);

            return {
              ...image,
              url: url,
            };
          })
        );
      } catch (urlError) {
        throw new UrlGenerationError("destination images", urlError as Error);
      }
    }

    return {
      ...destination,
      thumbnail,
      images,
    };
  } catch (error) {
    console.error("Error transforming destination to image URLs: ", error);
    if (
      error instanceof UrlGenerationError
    ) {
      throw error;
    }
    throw new ImageTransformationError(
      destination.id,
      error as Error
    );
  }
};

/**
 * Creates a new destination with associated resources
 * @description Creates a destination record in the database with cities, images, and FAQs
 * @param {Object} data - The destination creation data
 * @param {string} data.name - The name of the destination
 * @param {string} [data.content] - The content/description of the destination
 * @param {boolean} [data.featured] - Whether the destination is featured
 * @param {string} [data.currency] - The currency code for the destination
 * @param {string} [data.bestSeasonStart] - Best season start period
 * @param {string} [data.bestSeasonEnd] - Best season end period
 * @param {string[]} [data.languages] - Languages spoken in the destination
 * @param {Object[]} [data.cities] - Cities within the destination
 * @param {Object} [data.thumbnail] - Thumbnail image data
 * @param {Object[]} [data.images] - Additional images
 * @param {Object[]} [data.faqs] - Frequently asked questions
 * @returns {Promise<DestinationWithImageURLs>} The created destination with image URLs
 * @throws {DestinationAlreadyExistsError} When destination already exists
 * @throws {SlugGenerationError} When slug generation fails
 * @throws {DatabaseOperationError} When database operation fails
 * @example
 * const destination = await createDestination({ name: "Paris", featured: true });
 */
export const createDestination = async (data: {
  name: string;
  slug?: string;
  content?: string;
  featured?: boolean;
  currency?: string;
  bestSeasonStart?: string;
  bestSeasonEnd?: string;
  languages?: string[];
  cities?: { name: string; slug?: string }[];
  thumbnail?: {
    bucketName: string;
    fileName: string;
    altText?: string;
  } | null;
  images?: {
    bucketName: string;
    fileName: string;
    altText?: string;
  }[];
  faqs?: {
    question: string;
    answer: string;
  }[];
}): Promise<DestinationWithImageURLs> => {
  try {
    // Check if destination already exists
    const existingDestination = await prisma.destination.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingDestination) {
      throw new DestinationAlreadyExistsError(data.name);
    }

    // Generate unique slug
    let finalSlug;
    try {
      finalSlug = await checkAndReplaceSlug(createSlug(data.name));
    } catch (slugError) {
      throw new SlugGenerationError(data.name, slugError as Error);
    }

    let thumbnailId: string | undefined;

    if (data.thumbnail) {
      try {
        const thumbnail = await prisma.image.create({
          data: {
            bucketName: data.thumbnail.bucketName,
            fileName: data.thumbnail.fileName,
            altText: data.thumbnail.altText,
            // caption: data.thumbnail.caption, // Caption not supported in Image model
          },
        });

        thumbnailId = thumbnail.id;
      } catch (imageError) {
        throw new DatabaseOperationError(
          "create",
          "thumbnail image",
          imageError as Error
        );
      }
    }

    const destination = await prisma.destination.create({
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
                caption: image.caption,
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

    return transformDestinationToImageURLs(destination);
  } catch (error) {
    console.error("Error creating destination: ", error);
    if (
      error instanceof DestinationAlreadyExistsError ||
      error instanceof SlugGenerationError ||
      error instanceof DatabaseOperationError
    ) {
      throw error;
    }
    throw new DatabaseOperationError("create", "destination", error as Error);
  }
};

/**
 * Updates an existing destination
 * @description Updates destination information including cities, images, and FAQs
 * @param {Object} data - The destination update data
 * @param {string} data.id - The unique identifier of the destination to update
 * @param {string} [data.name] - The new name of the destination (optional)
 * @param {string} [data.content] - The new content/description (optional)
 * @param {boolean} [data.featured] - Whether the destination is featured (optional)
 * @param {string} [data.currency] - The currency code (optional)
 * @param {string} [data.bestSeasonStart] - Best season start period (optional)
 * @param {string} [data.bestSeasonEnd] - Best season end period (optional)
 * @param {string[]} [data.languages] - Languages spoken (optional)
 * @param {Object[]} [data.cities] - Cities within the destination (optional)
 * @param {Object} [data.thumbnail] - Thumbnail image data (optional)
 * @param {Object[]} [data.images] - Additional images (optional)
 * @param {Object[]} [data.faqs] - Frequently asked questions (optional)
 * @returns {Promise<DestinationWithImageURLs>} The updated destination with image URLs
 * @throws {DestinationNotFoundError} When destination is not found
 * @throws {SlugGenerationError} When slug generation fails
 * @throws {DatabaseOperationError} When database operation fails
 * @example
 * const destination = await updateDestination({ id: "dest-123", name: "New Paris" });
 */
export const updateDestination = async (data: {
  id: string;
  name?: string;
  slug?: string;
  content?: string;
  featured?: boolean;
  currency?: string;
  bestSeasonStart?: string;
  bestSeasonEnd?: string;
  languages?: string[];
  cities?: { id?: string; name?: string; slug?: string }[];
  thumbnailId?: string;
  thumbnail?: {
    bucketName: string;
    fileName: string;
    altText?: string;
  } | null;
  images?: {
    bucketName: string;
    fileName: string;
    altText?: string;
  }[];
  faqs?: {
    id?: string;
    question: string;
    answer: string;
  }[];
}): Promise<DestinationWithImageURLs> => {
  try {
    // Get current destination
    const currentDestination = await prisma.destination.findUnique({
      where: { id: data.id },
      include: {
        thumbnail: true,
        images: true,
        faqs: true,
        cities: true,
      },
    });

    if (!currentDestination) {
      throw new DestinationNotFoundError(data.id);
    }

  // If name is updated, check and replace slug
  let finalSlug = currentDestination.slug;
  if (data.name && data.name !== currentDestination.name) {
    finalSlug = await checkAndReplaceSlug(createSlug(data.name));
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
    // Note: images are handled separately below
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
          caption: data.thumbnail.caption,
        },
      };
    } else {
      // Create new thumbnail
      updateData.thumbnail = {
        create: {
          bucketName: data.thumbnail.bucketName || "",
          fileName: data.thumbnail.fileName || "",
          altText: data.thumbnail.altText,
          caption: data.thumbnail.caption,
        },
      };
    }
  } else if (
    Object.prototype.hasOwnProperty.call(data, "thumbnail") &&
    (data.thumbnail === null || data.thumbnail === undefined) &&
    currentDestination.thumbnailId
  ) {
    console.log("Delete thumbnail - explicitly set to null/undefined");
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
        caption: image.caption,
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

    const destination = await prisma.destination.update({
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

    return transformDestinationToImageURLs(destination);
  } catch (error) {
    console.error("Error updating destination: ", error);
    if (
      error instanceof DestinationNotFoundError ||
      error instanceof SlugGenerationError ||
      error instanceof DatabaseOperationError
    ) {
      throw error;
    }
    throw new DatabaseOperationError("update", "destination", error as Error);
  }
};

/**
 * Deletes a destination
 * @param id - The destination ID
 * @returns Success message
 */
export const deleteDestination = async (id: string) => {
  // Delete destination from database
  await prisma.destination.delete({
    where: { id },
  });

  return { message: "Destination deleted successfully" };
};

/**
 * Gets all destinations without pagination
 * @returns All destinations with image URLs
 */
export const getAllDestinations = async (query: string) => {
  if (!query) {
    query = "";
  }

  const destinations = await prisma.destination.findMany({
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
  console.log(destinations);

  // Return All destinations with image URLs
  const destinationsWithImageURLs = await Promise.all(
    destinations.map(async (destination) => {
      return transformDestinationToImageURLs(destination);
    })
  );

  console.log(destinationsWithImageURLs);

  return destinationsWithImageURLs;
};

/**
 * Gets a destination by ID
 * @param id - The destination ID
 * @returns The destination with image URLs
 */
export const getDestinationById = async (
  id: string
): Promise<DestinationWithImageURLs> => {
  const destination = await prisma.destination.findUnique({
    where: { id },
    include: {
      thumbnail: true,
      images: true,
      faqs: true,
      cities: true,
    },
  });

  if (!destination) {
    throw new Error("Destination not found");
  }

  return transformDestinationToImageURLs(destination);
};
