import NextAuth, { AuthOptions } from "next-auth";

const authOptions: AuthOptions = {
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
            redirect_uri: process.env.NEXT_PUBLIC_SSO_REDIRECT_URI!,
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
      userinfo: `${process.env.NEXT_PUBLIC_SSO_BASE_URL}/users/me`,
      idToken: false,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.id,
          email: profile.email,
          name: `${profile.firstName} ${profile.lastName}`,
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
    jwt: async ({ token, account, user }) => {
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
        };
      }
      return session;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
