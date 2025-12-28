import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook"
import { cookies } from 'next/headers';
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
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
      if (account && account.provider === "google") {
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
          if (data?.googleLogin) {
            token.accessToken = data.googleLogin.token;
            token.role = data.googleLogin.user.role;
            token.username = data.googleLogin.user.username;
            token.id = data.googleLogin.user.id;
          }
        } catch (error) {
          console.error("NextAuth Google sync error:", error);
        }
      }

      // --- 2. FACEBOOK LOGIC (NEW) ---
      if (account && account.provider === "facebook") {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                mutation FacebookLogin($accessToken: String!) {
                  facebookLogin(accessToken: $accessToken) {
                    token
                    user { id email username role }
                  }
                }
              `,
              variables: { accessToken: account.access_token } 
            })
          });

          const { data } = await res.json();
          if (data?.facebookLogin) {
            token.accessToken = data.facebookLogin.token;
            token.role = data.facebookLogin.user.role;
            token.username = data.facebookLogin.user.username;
            token.id = data.facebookLogin.user.id;
          } else {
             console.error("Facebook Login failed at Backend:", data);
          }
        } catch (error) {
          console.error("NextAuth Facebook sync error:", error);
        }
      }

      if (user?.accessToken) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.username = user.username;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };