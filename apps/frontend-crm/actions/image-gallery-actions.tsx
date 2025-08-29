"use server";

import { get, post, del, BackendApiResponse } from "@/lib/fetch-wrapper";

export interface GetImageFileUrlType {
  data: {
    url: string;
  };
}

// Use the BackendApiResponse from fetch-wrapper for consistency
export type ApiResponse<T> = BackendApiResponse<T>;

export async function getImageUrl(
  fileId: string
): Promise<ApiResponse<GetImageFileUrlType>> {
  try {
    const { data, error } = await get<GetImageFileUrlType>(
      `/image-gallery/files/${fileId}/url`
    );
    if (error) {
      console.error("Error fetching image file URL:", error);
      return {
        status: "error",
        message: error.message || "Failed to fetch image file URL",
      };
    }

    return {
      status: "success",
      message: "Image file URL fetched successfully",
      data: data || undefined,
    };
  } catch (error) {
    console.error("Error fetching image file URL:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch image file URL",
    };
  }
}
