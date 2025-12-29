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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // ⚠️ API URL சரியாக இருப்பதை உறுதி செய்யவும்
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
          
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                mutation Login($input: LoginInput!) {
                  login(input: $input) {
                    token
                    user { id email username role phoneNumber isEmailVerified }
                  }
                }
              `,
              variables: {
                input: { email: credentials?.email, password: credentials?.password }
              }
            })
          });

          const responseData = await res.json();

          if (responseData.errors) {
            console.error("Backend Auth Error:", responseData.errors[0].message);
            throw new Error(responseData.errors[0].message);
          }

          const user = responseData.data?.login?.user;
          const token = responseData.data?.login?.token;

          if (user && token) {
            return {
              ...user,
              accessToken: token
            };
          }
          
          return null;
        } catch (error: any) {
          console.error("Authorize function error:", error.message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      console.log('🔑 JWT Callback Start:', {
        hasAccount: !!account,
        accountProvider: account?.provider,
        hasUser: !!user,
        userAccessToken: user?.accessToken ? 'Present' : 'Missing',
        tokenAccessToken: token?.accessToken ? 'Present' : 'Missing'
      });

      if (account && account.provider === "google") {
        console.log('🔵 Google login detected in JWT callback');
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                mutation GoogleLogin($idToken: String!) {
                  googleLogin(idToken: $idToken) {
                    token
                    user { id email username role }
                  }
                }
              `,
              variables: { idToken: account.id_token }
            })
          });

          const { data } = await res.json();
          console.log('🔵 Google login response:', data?.googleLogin ? 'Success' : 'Failed');

          if (data?.googleLogin) {
            token.accessToken = data.googleLogin.token;
            token.role = data.googleLogin.user.role;
            token.username = data.googleLogin.user.username;
            token.id = data.googleLogin.user.id;
            console.log('✅ Google JWT token set:', {
              hasToken: !!token.accessToken,
              role: token.role,
              id: token.id
            });
          }
        } catch (error) {
          console.error("❌ NextAuth Google sync error:", error);
        }
      }

      if (user) {
        console.log('👤 User object present, checking accessToken...');
        // Only set values if not already set (e.g., from Google/Email login backend response)
        if (!token.accessToken && user.accessToken) {
          token.accessToken = user.accessToken;
          console.log('📧 Email login: accessToken set from user object');
        }
        if (!token.role && user.role) {
          token.role = user.role;
        }
        if (!token.username && user.username) {
          token.username = user.username;
        }
        if (!token.id && user.id) {
          token.id = user.id;
        }
      }

      console.log('🔑 JWT Callback End:', {
        finalAccessToken: token?.accessToken ? 'Present' : 'Missing',
        finalRole: token?.role,
        finalId: token?.id
      });

      return token;
    },
    async session({ session, token }: any) {
      console.log('🔄 NextAuth Session Callback:', {
        hasToken: !!token,
        accessToken: token?.accessToken ? 'Present' : 'Missing',
        tokenRole: token?.role,
        sessionUser: !!session?.user,
        tokenId: token?.id,
        tokenEmail: token?.email
      });

      if (token) {
        session.accessToken = token.accessToken;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.id = token.id || token.sub; // Use sub for Google users if id not set
      }
      return session;
    }
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };