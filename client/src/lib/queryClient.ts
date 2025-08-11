import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Use window.location to determine the API URL
  // Use the same origin for API requests when possible to avoid CORS issues
  const baseUrl = window.location.origin;

  // Add /api prefix if not already present and not a full URL
  const fullUrl = url.startsWith("http")
    ? url
    : url.startsWith("/api")
      ? `${baseUrl}${url}`
      : `${baseUrl}/api${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Use window.location to determine the API URL
    const baseUrl = window.location.origin;

    // Create endpoint from query key parts
    const endpoint = queryKey.join("/") as string;

    // Add /api prefix if not already present and not a full URL
    const fullUrl = endpoint.startsWith("http")
      ? endpoint
      : endpoint.startsWith("/api")
        ? `${baseUrl}${endpoint}`
        : `${baseUrl}/api/${endpoint}`;

    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
