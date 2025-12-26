// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const userRole = token?.role as string;

    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const authPages = ["/login", "/register"];
    if ((authPages.includes(pathname) || pathname === "/") && token) {
      const redirectUrl = userRole === "ADMIN" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (
          pathname === "/" || 
          pathname === "/login" || 
          pathname === "/register" ||
          pathname.startsWith("/cars") 
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/dashboard/:path*",
    "/bookings/:path*",
    "/verification/:path*",
    "/payment/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};