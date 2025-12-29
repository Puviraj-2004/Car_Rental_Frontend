import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      username?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    role?: string;
    username?: string;
  }
}