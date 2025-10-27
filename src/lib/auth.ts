import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT) {
  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
      client_id: process.env.SSO_CLIENT_ID!,
      client_secret: process.env.SSO_CLIENT_SECRET!,
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_SSO_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    const newToken = {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires:
        Date.now() + (refreshedTokens.expires_in ?? 3600) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };

    return newToken;
  } catch (error) {
    console.error("[REFRESH] Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    {
      name: "Nsite",
      id: "nsite",
      type: "oauth",
      clientId: process.env.NEXT_PUBLIC_SSO_CLIENT_ID,
      clientSecret: process.env.SSO_CLIENT_SECRET,
      authorization: {
        url: `${process.env.NEXT_PUBLIC_SSO_BASE_URL}/oauth/authorize`,
        params: { scope: "openid profile email" },
      },
      token: {
        url: `${process.env.NEXT_PUBLIC_SSO_BASE_URL}/oauth/token`,
        async request(context) {
          const params = new URLSearchParams({
            grant_type: "authorization_code",
            code: context.params.code!,
            redirect_uri: context.provider.callbackUrl!,
            client_id: context.provider.clientId!,
            client_secret: context.provider.clientSecret!,
            code_verifier: context.checks.code_verifier!,
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { url } = context.provider.token as any;

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
          });

          const tokens = await response.json();

          if (!response.ok) {
            throw new Error(`Token exchange failed: ${JSON.stringify(tokens)}`);
          }

          return { tokens };
        },
      },
      userinfo: {
        url: `${process.env.NEXT_PUBLIC_SSO_BASE_URL}/oauth/userinfo`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async request(context: any) {
          const response = await fetch(context.provider.userinfo?.url, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          });

          if (!response.ok) {
            throw new Error(
              `Userinfo request failed: ${response.status} ${response.statusText}`
            );
          }

          return await response.json();
        },
      },
      idToken: false,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub || profile.id,
          email: profile.email,
          email_verified: profile.email_verified,
          name: profile.name,
          given_name: profile.given_name,
          family_name: profile.family_name,
        };
      },
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/api/auth/signin",
    error: "/api/auth/error",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in - store all user data in token
      if (trigger === "signIn" && account && user) {
        // account.expires_at is a Unix timestamp in seconds, convert to milliseconds
        const expiresAtMs = account.expires_at
          ? Number(account.expires_at) * 1000
          : Date.now() + 3600 * 1000;

        console.log('[JWT] Initial sign in - expires_at:', new Date(expiresAtMs).toISOString());

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: expiresAtMs,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      }

      // Session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      // If there's an error from a previous refresh attempt, don't try again
      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // Return previous token if the access token has not expired yet
      // Add 60 second buffer to refresh before actual expiration
      const expiresAt = token.accessTokenExpires as number;
      const now = Date.now();
      const shouldRefresh = now >= (expiresAt - 60000);

      console.log('[JWT] Checking token expiry:', {
        now: new Date(now).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        timeUntilExpiry: Math.round((expiresAt - now) / 1000) + 's',
        shouldRefresh,
      });

      if (!shouldRefresh) {
        return token;
      }

      // Access token is about to expire or has expired, try to refresh it
      console.log('[JWT] Token expired or expiring soon, attempting refresh...');
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Rebuild session from token data
      return {
        ...session,
        user: {
          ...session.user,
        },
        accessToken: token.accessToken,
      };
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: `__Secure-next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: `__Secure-next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
};
