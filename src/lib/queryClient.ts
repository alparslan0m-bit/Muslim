import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * HTTP error class with status code
 */
class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Check if response is OK, throw descriptive error if not
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Special handling for authentication errors
    if (res.status === 401 || res.status === 403) {
      throw new HttpError(res.status, res.statusText, 
        "Unauthorized. Please check your credentials.");
    }
    
    // Handle CORS errors
    if (res.status === 0 || res.statusText === "") {
      throw new HttpError(res.status, res.statusText,
        "Network error. Check your connection and CORS settings.");
    }
    
    throw new HttpError(res.status, res.statusText, `${res.status}: ${text}`);
  }
}

/**
 * Build headers for API requests with authentication support
 */
function buildHeaders(data?: unknown, token?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add authentication token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Make API requests with proper CORS, auth, and error handling
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  token?: string
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: buildHeaders(data, token),
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Include cookies for CORS
      // Add timeout for slower networks
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Handle network errors and CORS failures
    if (error instanceof TypeError) {
      throw new HttpError(0, "NetworkError",
        "Network request failed. Check your internet connection.");
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Create a query function with configurable 401 handling
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  token?: string;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, token }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey.join("/") as string, {
        headers: buildHeaders(undefined, token),
        credentials: "include",
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      // Handle 401/403 based on configuration
      if ((res.status === 401 || res.status === 403)) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        throw new HttpError(res.status, res.statusText,
          "Authentication required. Please log in.");
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Provide helpful error messages
      if (error instanceof TypeError) {
        throw new HttpError(0, "NetworkError",
          "Network error. Check your connection and CORS settings.");
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
