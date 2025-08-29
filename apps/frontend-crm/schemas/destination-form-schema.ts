import { z } from "zod";

/**
 * Schema for validating destination creation form input
 * Aligns with tRPC createDestinationSchema but adapted for frontend form validation
 */
export const createDestinationFormSchema = z.object({
  name: z
    .string()
    .min(1, "Destination name is required")
    .max(200, "Destination name must not exceed 200 characters")
    .regex(
      /^[a-zA-Z0-9\s\-'.,()&]+$/,
      "Destination name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands"
    ),
  content: z
    .string()
    .max(10000, "Content must not exceed 10000 characters")
    .nullable()
    .optional(),
  featured: z.boolean().default(false),
  currency: z
    .string()
    .max(10, "Currency code must not exceed 10 characters")
    .regex(/^[A-Z]{3}$/, "Currency must be a valid 3-letter ISO code")
    .optional(),
  bestSeasonStart: z.string().nullable().optional(),
  bestSeasonEnd: z.string().nullable().optional(),
  languages: z
    .array(z.string().min(1, "Language cannot be empty"))
    .max(20, "Maximum 20 languages allowed")
    .default([]),
  cities: z
    .array(z.string().min(1, "City name cannot be empty"))
    .max(50, "Maximum 50 cities allowed")
    .default([]),
  thumbnail: z
    .object({
      id: z.string().optional(),
      fileName: z.string().min(1, "File name is required"),
      bucketName: z.string().min(1, "Bucket name is required"),
      altText: z.string().max(200, "Alt text must not exceed 200 characters").optional(),
      url: z.string().optional(),
    })
    .nullable()
    .optional(),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        fileName: z.string().min(1, "File name is required"),
        bucketName: z.string().min(1, "Bucket name is required"),
        altText: z.string().max(200, "Alt text must not exceed 200 characters").optional(),
        url: z.string().optional(),
      })
    )
    .max(20, "Maximum 20 images allowed")
    .default([]),
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
    .default([]),
});

/**
 * Schema for validating destination update form input
 * Aligns with tRPC updateDestinationSchema but adapted for frontend form validation
 */
export const updateDestinationFormSchema = z.object({
  id: z.string().min(1, "Destination ID is required"),
  name: z
    .string()
    .min(1, "Destination name is required")
    .max(200, "Destination name must not exceed 200 characters")
    .regex(
      /^[a-zA-Z0-9\s\-'.,()&]+$/,
      "Destination name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands"
    ),
  content: z
    .string()
    .max(10000, "Content must not exceed 10000 characters")
    .nullable()
    .optional(),
  featured: z.boolean().default(false),
  currency: z
    .string()
    .max(10, "Currency code must not exceed 10 characters")
    .regex(/^[A-Z]{3}$/, "Currency must be a valid 3-letter ISO code")
    .optional(),
  bestSeasonStart: z.string().nullable().optional(),
  bestSeasonEnd: z.string().nullable().optional(),
  languages: z
    .array(z.string().min(1, "Language cannot be empty"))
    .max(20, "Maximum 20 languages allowed")
    .default([]),
  cities: z
    .array(z.string().min(1, "City name cannot be empty"))
    .max(50, "Maximum 50 cities allowed")
    .default([]),
  thumbnail: z
    .object({
      id: z.string().optional(),
      fileName: z.string().min(1, "File name is required"),
      bucketName: z.string().min(1, "Bucket name is required"),
      altText: z.string().max(200, "Alt text must not exceed 200 characters").optional(),
      url: z.string().optional(),
    })
    .nullable()
    .optional(),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        fileName: z.string().min(1, "File name is required"),
        bucketName: z.string().min(1, "Bucket name is required"),
        altText: z.string().max(200, "Alt text must not exceed 200 characters").optional(),
        url: z.string().optional(),
      })
    )
    .max(20, "Maximum 20 images allowed")
    .default([]),
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
    .default([]),
});

// Type exports for use in components
export type CreateDestinationFormValues = z.infer<typeof createDestinationFormSchema>;
export type UpdateDestinationFormValues = z.infer<typeof updateDestinationFormSchema>;