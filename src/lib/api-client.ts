/**
 * Enhanced fetch wrapper that handles authentication errors and token expiration.
 * Automatically redirects to sign out when tokens expire.
 */
export async function apiFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);
  const isDev = process.env.NODE_ENV === "development";

  // Check for 401 errors with shouldLogout flag
  if (response.status === 401) {
    try {
      const data = await response.clone().json();
      if (data.shouldLogout) {
        // Session expired - clear local storage and redirect to SSO logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");

          // Sign out from NextAuth (clears local session)
          const { signOut } = await import("next-auth/react");
          await signOut({ redirect: false });

          // Redirect to SSO logout page which will clear SSO session
          window.location.href = isDev
            ? `https://staging-sso.mybackhub.com/auth/logout?return_to=${encodeURIComponent(
                process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
              )}`
            : `https://sso.mybackhub.com/auth/logout?return_to=${encodeURIComponent(
                process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
              )}`;
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
