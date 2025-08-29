import type {
  CreateDestinationInput,
  UpdateDestinationInput,
  GetDestinationByIdInput,
  DeleteDestinationInput,
  GetAllDestinationsInput,
  DestinationWithImageURLs,
} from "@workspace/trpc";

// Re-export tRPC types for use in components
export type {
  CreateDestinationInput,
  UpdateDestinationInput,
  GetDestinationByIdInput,
  DeleteDestinationInput,
  GetAllDestinationsInput,
};

// Main destination type from tRPC
export type Destination = DestinationWithImageURLs;

// Frontend-specific form types
export interface CreateDestinationFormValues {
  name: string;
  content?: string | null;
  featured: boolean;
  currency?: string;
  bestSeasonStart?: string | null;
  bestSeasonEnd?: string | null;
  languages: string[];
  cities: string[];
  thumbnail?: {
    id?: string;
    fileName: string;
    bucketName: string;
    altText?: string;
    url?: string;
  } | null;
  images: Array<{
    id?: string;
    fileName: string;
    bucketName: string;
    altText?: string;
    url?: string;
  }>;
  faqs: Array<{
    id?: string;
    question: string;
    answer: string;
  }>;
}

export interface UpdateDestinationFormValues extends CreateDestinationFormValues {
  id: string;
}

// API response types
export interface GetDestinationsResponse {
  destinations: Destination[];
}

export interface GetDestinationResponse {
  destination: Destination;
}

export interface CreateDestinationResponse {
  destination: Destination;
}

export interface UpdateDestinationResponse {
  destination: Destination;
}

export interface DeleteDestinationResponse {
  message: string;
}

// Table column types
export interface DestinationTableData {
  id: string;
  name: string;
  featured: boolean;
  currency?: string;
  citiesCount: number;
  imagesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Hook mutation types
export interface CreateDestinationMutationData {
  data: CreateDestinationInput;
}

export interface UpdateDestinationMutationData {
  id: string;
  data: Partial<UpdateDestinationInput>;
}

export interface DeleteDestinationMutationData {
  id: string;
}