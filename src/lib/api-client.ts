export const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * Generates or retrieves a unique session identifier.
 * The ID persists for the browser session (stored in sessionStorage).
 */
function getSessionId(): string {
  if (typeof window === "undefined") {
    return crypto.randomUUID();
  }

  const STORAGE_KEY = "x-correlation-session-id";
  let sessionId = sessionStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Server-side fetch wrapper that forwards the x-correlation-id header.
 * Use this in API routes to forward the correlation ID to external APIs.
 */
export async function serverFetch(
  url: string,
  options: RequestInit & { correlationId?: string | null }
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (options.correlationId) {
    headers.set(CORRELATION_ID_HEADER, options.correlationId);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Extracts the correlation ID from incoming request headers.
 * Use this in API routes to get the correlation ID from the client request.
 */
export function getCorrelationId(request: Request): string | null {
  return request.headers.get(CORRELATION_ID_HEADER);
}

/**
 * Enhanced fetch wrapper that handles authentication errors and token expiration.
 * Automatically redirects to sign out when tokens expire.
 */
export async function apiFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const headers = new Headers(options?.headers);
  headers.set(CORRELATION_ID_HEADER, getSessionId());

  const response = await fetch(url, {
    ...options,
    headers,
  });
  const isDev = process.env.NODE_ENV === "development";

  // Check for 401 errors with shouldLogout flag
  if (response.status === 401) {
    try {
      const data = await response.clone().json();
      if (data.shouldLogout) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");

          // Just trigger NextAuth signin - don't destroy SSO session
          const { signOut } = await import("next-auth/react");
          await signOut({ callbackUrl: "/api/auth/signin" });
        }
        throw new Error("Session expired");
      }
    } catch (error) {
      // If parsing fails, just return the original response
      if (error instanceof Error && error.message === "Session expired") {
        throw error;
      }
    }
  }

  return response;
}
