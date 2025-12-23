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
        const res = await fetch("http://localhost:4000/graphql", {
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

        const json = await res.json();

        if (json.errors) return null;

        return {
          id: json.data.login.user.id,
          email: json.data.login.user.email,
          name: `${json.data.login.user.firstName} ${json.data.login.user.lastName}`,
          role: json.data.login.user.role,
          accessToken: json.data.login.token,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.id = (user as any).id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).id = token.id;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // The redirect logic will be handled by the login page and middleware
      // Since we can't access the token in the redirect callback directly
      // we'll rely on the middleware and page-level checks
      
      // Default behavior: allow callback to the same domain
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },

  pages: {
    signIn: "/auth/login",
  },
});

export { handler as GET, handler as POST };
