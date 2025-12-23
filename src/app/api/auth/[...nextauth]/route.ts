import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const MAX_RETRIES = 2;
        const RETRY_DELAY = 300; // ms

        if (process.env.NODE_ENV !== 'production') console.log('[nextauth] authorize - attempt for', credentials?.email);

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:4000/graphql';
          const res = await fetch(GRAPHQL_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: `
                  mutation Login($input: LoginInput!) {
                    login(input: $input) {
                      token
                      user {
                        id
                        email
                        firstName
                        lastName
                        role
                      }
                    }
                  }
                `,
                variables: {
                  input: {
                    email: credentials?.email,
                    password: credentials?.password,
                  },
                },
              }),
            });

            if (!res.ok) {
              if (process.env.NODE_ENV !== 'production') console.error('[nextauth] authorize - network error from backend:', res.status, res.statusText);
              // For 5xx errors we can retry; for 4xx, no need
              if (res.status >= 500 && attempt < MAX_RETRIES) {
                await new Promise((r) => setTimeout(r, RETRY_DELAY));
                continue;
              }
              return null;
            }

            const json = await res.json();

            if (json.errors || !json.data?.login?.user) {
              if (process.env.NODE_ENV !== 'production') console.error('[nextauth] authorize - graphql errors or missing user', json.errors);
              return null;
            }

            return {
              id: json.data.login.user.id,
              email: json.data.login.user.email,
              name: `${json.data.login.user.firstName} ${json.data.login.user.lastName}`,
              role: json.data.login.user.role,
              accessToken: json.data.login.token,
            };
          } catch (e: any) {
            if (process.env.NODE_ENV !== 'production') console.error('[nextauth] authorize - fetch threw:', e?.message || e);
            // If we still have retries left, wait and retry
            if (attempt < MAX_RETRIES) {
              await new Promise((r) => setTimeout(r, RETRY_DELAY));
              continue;
            }
            // Final failure: return null to indicate auth failure (avoids NextAuth error page)
            return null;
          }
        }

        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user }) {
      // Redirect admins to the admin dashboard immediately after sign-in
      try {
        if ((user as any).role === 'ADMIN') {
          if (process.env.NODE_ENV !== 'production') console.log('[nextauth] signIn: detected ADMIN user, returning /admin/dashboard');
          // Return a relative path to avoid origin/port mismatch issues in dev
          return '/admin/dashboard';
        }
      } catch (e) {
        // fallback to default
      }
      if (process.env.NODE_ENV !== 'production') console.log('[nextauth] signIn: defaulting to true');
      return true;
    },

    async jwt({ token, user }) {
      if (process.env.NODE_ENV !== 'production') console.log('[nextauth] jwt callback - user:', !!user, 'token:', token);
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.id = (user as any).id;
      }
      return token;
    },

    async session({ session, token }) {
      if (process.env.NODE_ENV !== 'production') console.log('[nextauth] session callback - token role:', token?.role);
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).id = token.id;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (process.env.NODE_ENV !== 'production') console.log('[nextauth] redirect callback - url:', url, 'baseUrl:', baseUrl);
      // Prevent open redirects — allow only internal redirects
      try {
        const target = new URL(url, baseUrl);
        if (target.origin !== baseUrl) return baseUrl;
        return target.toString();
      } catch (e) {
        return baseUrl;
      }
    }

  },

  pages: {
    signIn: "/auth/login",
    // Redirect auth errors back to the login page so we can show friendly messages there
    error: "/auth/login",
  },
});

export { handler as GET, handler as POST };
