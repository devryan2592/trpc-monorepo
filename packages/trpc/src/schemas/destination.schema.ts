import { z } from "zod";

/**
 * Schema for validating destination creation input
 * @description Validates destination creation data including name, content, and associated resources
 */
export const createDestinationSchema = z.object({
  name: z
    .string()
    .min(1, "Destination name is required")
    .max(200, "Destination name must not exceed 200 characters")
    .regex(
      /^[a-zA-Z0-9\s\-'.,()&]+$/,
      "Destination name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands"
    ),
  slug: z.string().optional(),
  content: z.string().max(10000, "Content must not exceed 10000 characters").optional(),
  featured: z.boolean().default(false),
  currency: z
    .string()
    .max(10, "Currency code must not exceed 10 characters")
    .regex(/^[A-Z]{3}$/, "Currency must be a valid 3-letter ISO code")
    .optional(),
  bestSeasonStart: z.string().optional(),
  bestSeasonEnd: z.string().optional(),
  languages: z
    .array(
      z.string().min(1, "Language cannot be empty")
    )
    .max(20, "Maximum 20 languages allowed")
    .optional(),
  cities: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "City name is required")
          .max(100, "City name must not exceed 100 characters"),
        slug: z.string().optional(),
      })
    )
    .max(50, "Maximum 50 cities allowed")
    .optional(),
  thumbnail: z
    .object({
      bucketName: z.string().min(1, "Bucket name is required"),
      fileName: z.string().min(1, "File name is required"),
      altText: z.string().max(200, "Alt text must not exceed 200 characters").optional(),
    })
    .nullable()
    .optional(),
  images: z
    .array(
      z.object({
        bucketName: z.string().min(1, "Bucket name is required"),
        fileName: z.string().min(1, "File name is required"),
        altText: z.string().max(200, "Alt text must not exceed 200 characters").optional(),
      })
    )
    .max(20, "Maximum 20 images allowed")
    .optional(),
  faqs: z
    .array(
      z.object({
        question: z
          .string()
          .min(1, "Question is required")
          .max(500, "Question must not exceed 500 characters"),
        answer: z
          .string()
          .min(1, "Answer is required")
          .max(2000, "Answer must not exceed 2000 characters"),
      })
    )
    .max(20, "Maximum 20 FAQs allowed")
    .optional(),
});

/**
 * Schema for validating destination update input
 * @description Validates destination update data with optional fields
 */
export const updateDestinationSchema = z.object({
  id: z.string().min(1, "Destination ID is required"),
  name: z
    .string()
    .min(1, "Destination name is required")
    .max(200, "Destination name must not exceed 200 characters")
    .regex(
      /^[a-zA-Z0-9\s\-'.,()&]+$/,
      "Destination name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands"
    )
    .optional(),
  slug: z.string().optional(),
  content: z.string().max(10000, "Content must not exceed 10000 characters").optional(),
  featured: z.boolean().optional(),
  currency: z
    .string()
    .max(10, "Currency code must not exceed 10 characters")
    .regex(/^[A-Z]{3}$/, "Currency must be a valid 3-letter ISO code")
    .optional(),
  bestSeasonStart: z.string().optional(),
  bestSeasonEnd: z.string().optional(),
  languages: z
    .array(
      z.string().min(1, "Language cannot be empty")
    )
    .max(20, "Maximum 20 languages allowed")
    .optional(),
  cities: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z
          .string()
          .min(1, "City name is required")
          .max(100, "City name must not exceed 100 characters")
          .optional(),
        slug: z.string().optional(),
      })
    )
    .max(50, "Maximum 50 cities allowed")
    .optional(),
  thumbnailId: z.string().optional(),
  thumbnail: z
    .object({
      bucketName: z.string().min(1, "Bucket name is required"),
      fileName: z.string().min(1, "File name is required"),
      altText: z.string().max(200, "Alt text must not exceed 200 characters").optional(),
    })
    .nullable()
    .optional(),
  images: z
    .array(
      z.object({
        bucketName: z.string().min(1, "Bucket name is required"),
        fileName: z.string().min(1, "File name is required"),
        altText: z.string().max(200, "Alt text must not exceed 200 characters").optional(),
      })
    )
    .max(20, "Maximum 20 images allowed")
    .optional(),
  faqs: z
    .array(
      z.object({
        id: z.string().optional(),
        question: z
          .string()
          .min(1, "Question is required")
          .max(500, "Question must not exceed 500 characters"),
        answer: z
          .string()
          .min(1, "Answer is required")
          .max(2000, "Answer must not exceed 2000 characters"),
      })
    )
    .max(20, "Maximum 20 FAQs allowed")
    .optional(),
});

/**
 * Schema for validating destination retrieval by ID
 * @description Validates destination retrieval request by ID
 */
export const getDestinationByIdSchema = z.object({
  id: z.string().min(1, "Destination ID is required"),
});

/**
 * Schema for validating destination deletion
 * @description Validates destination deletion request
 */
export const deleteDestinationSchema = z.object({
  id: z.string().min(1, "Destination ID is required"),
});

/**
 * Schema for validating get all destinations request
 * @description Validates request to get all destinations with optional search
 */
export const getAllDestinationsSchema = z.object({
  q: z
    .string()
    .max(100, "Search query must not exceed 100 characters")
    .optional(),
});

// Type exports for use in services and routes
export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;
export type GetDestinationByIdInput = z.infer<typeof getDestinationByIdSchema>;
export type DeleteDestinationInput = z.infer<typeof deleteDestinationSchema>;
export type GetAllDestinationsInput = z.infer<typeof getAllDestinationsSchema>;