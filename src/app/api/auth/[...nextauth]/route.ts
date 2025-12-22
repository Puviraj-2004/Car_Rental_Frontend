import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
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

          // ❌ பேக்கெண்ட் தரும் எரரை (e.g. Invalid password / OTP not verified) பிடிக்க
          if (json.errors) {
            throw new Error(json.errors[0].message);
          }

          const loginData = json.data?.login;

          if (loginData && loginData.user) {
            // ✅ Next-Auth எதிர்பார்க்கும் வடிவில் டேட்டாவை அனுப்புதல்
            return {
              id: loginData.user.id,
              email: loginData.user.email,
              name: `${loginData.user.firstName} ${loginData.user.lastName}`,
              role: loginData.user.role,
              accessToken: loginData.token,
            };
          }

          return null;
        } catch (error: any) {
          // இதுதான் லாகின் பக்கத்தில் Pop-up-இல் தெரியப்போகும் மெசேஜ்
          throw new Error(error.message || "Authentication failed");
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };