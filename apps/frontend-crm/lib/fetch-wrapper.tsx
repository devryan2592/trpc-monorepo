// Backend API response structure
export interface BackendApiResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: string[];
}

// Types for the fetch wrapper
export type FetchOptions = RequestInit & {
  params?: Record<string, string>;
  baseUrl?: string;
};

export type FetchResponse<T> = {
  data: T | null;
  error: Error | null;
  status: number;
  response?: Response;
  backendResponse?: BackendApiResponse<T>;
};

// Default API URL - can be overridden with environment variables
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Helper to check if code is running on server or client
const isServer = () => typeof window === "undefined";

// Helper to format URL with query parameters
const formatUrl = (endpoint: string, options: FetchOptions): string => {
  const baseUrl = options.baseUrl || API_URL;
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  // Add query parameters if they exist
  if (options.params) {
    const queryParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    if (queryString) {
      return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
    }
  }

  return url;
};

// Get server-side cookies for the request
const getServerCookies = async () => {
  // Only import these in a server context
  if (isServer()) {
    console.log("Server Called");
    try {
      const { cookies, headers } = await import("next/headers");
      const cookieStore = await cookies();
      const headersList = await headers();

      const sessionToken = cookieStore.get("st_.session_token");
      const userAgent = headersList.get("user-agent");

      return { sessionToken, userAgent };
    } catch (error) {
      console.error("Error accessing cookies on server:", error);
      return { sessionToken: null, userAgent: null };
    }
  }

  return { sessionToken: null, userAgent: null };
};

// Main fetch wrapper function
export async function fetchWrapper<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  try {
    // Format the URL with any query parameters
    const url = formatUrl(endpoint, options);

    // Prepare headers
    const fetchOptions: RequestInit = { ...options };
    fetchOptions.headers = new Headers(options.headers || {});

    // Set default headers if not provided
    // Don't set Content-Type for FormData - let browser handle it
    if (
      !fetchOptions.headers.has("Content-Type") &&
      !(options.body instanceof FormData)
    ) {
      fetchOptions.headers.set("Content-Type", "application/json");
    }

    // Handle cookies for server-side requests
    if (isServer()) {
      const { sessionToken, userAgent } = await getServerCookies();

      if (sessionToken) {
        fetchOptions.headers.set(
          "Cookie",
          `st_.session_token=${sessionToken.value}`
        );
      }

      if (userAgent) {
        fetchOptions.headers.set("User-Agent", userAgent);
      }
    } else {
      // For client-side requests, include credentials to send cookies
      fetchOptions.credentials = "include";
    }

    // Remove params from fetchOptions as it's not a standard fetch option
    if ("params" in fetchOptions) {
      delete fetchOptions.params;
    }

    // Remove baseUrl from fetchOptions as it's not a standard fetch option
    if ("baseUrl" in fetchOptions) {
      delete fetchOptions.baseUrl;
    }

    // Execute the fetch request
    const response = await fetch(url, fetchOptions);

    // Handle different response types
    let rawData = null;
    const contentType = response.headers.get("Content-Type") || "";

    if (contentType.includes("application/json")) {
      rawData = await response.json();
      console.log("JSON Data:", rawData);
    } else if (contentType.includes("text/")) {
      // Handle text responses
      rawData = await response.text();
    } else {
      // For other types (like blobs), just return the response
      return {
        data: null,
        error: null,
        status: response.status,
        response,
      };
    }

    // Check if this is a backend API response structure
    const isBackendApiResponse =
      typeof rawData === "object" &&
      rawData !== null &&
      "status" in rawData &&
      "message" in rawData;

    if (isBackendApiResponse) {
      const backendResponse = rawData as BackendApiResponse<T>;

      // Handle backend error responses
      if (backendResponse.status === "error" || !response.ok) {
        const errorMessage =
          backendResponse.message ||
          `API error: ${response.status} ${response.statusText}`;
        const errors = backendResponse.errors || [];
        const fullErrorMessage =
          errors.length > 0
            ? `${errorMessage}. Details: ${errors.join(", ")}`
            : errorMessage;

        return {
          data: null,
          error: new Error(fullErrorMessage),
          status: response.status,
          response,
          backendResponse,
        };
      }

      // Handle successful backend responses
      return {
        data: backendResponse.data || null,
        error: null,
        status: response.status,
        response,
        backendResponse,
      };
    }

    // Handle non-backend API responses (fallback to original behavior)
    if (!response.ok) {
      const error = new Error(
        typeof rawData === "object" && rawData !== null && "message" in rawData
          ? String(rawData.message)
          : `API error: ${response.status} ${response.statusText}`
      );

      return {
        data: null,
        error,
        status: response.status,
        response,
      };
    }

    return {
      data: rawData as T,
      error: null,
      status: response.status,
      response,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
      status: 0, // Network error or other client-side error
    };
  }
}

// HTTP method wrappers
export async function get<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, { ...options, method: "GET" });
}

export async function post<T>(
  endpoint: string,
  data?: unknown,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, {
    ...options,
    method: "POST",
    body:
      data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
  });
}

export async function put<T>(
  endpoint: string,
  data?: unknown,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, {
    ...options,
    method: "PUT",
    body:
      data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
  });
}

export async function patch<T>(
  endpoint: string,
  data?: unknown,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, {
    ...options,
    method: "PATCH",
    body:
      data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
  });
}

export async function del<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, { ...options, method: "DELETE" });
}
