import { Destination, Image, City, FAQ } from "@/generated/prisma";

export type DestinationWithRelations = Destination & {
  cities: City[];
  thumbnail?: Image | null;
  images?: Image[];
  faqs?: FAQ[];
};

// Custom Destination Type with Image URLs
export type DestinationWithImageURLs = {
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

// API Response Types

export type CreateDestinationResponseType = {
  destination: DestinationWithImageURLs;
};

export type UpdateDestinationResponseType = {
  destination: DestinationWithImageURLs;
};

export type GetDestinationResponseType = {
  destination: DestinationWithImageURLs;
};

export type GetDestinationsResponseType = {
  destinations: DestinationWithImageURLs[];
};

export type DeleteDestinationResponseType = {
  message: string;
};

export type SearchDestinationsResponseType = {
  destinations: DestinationWithImageURLs[];
  total: number;
};
