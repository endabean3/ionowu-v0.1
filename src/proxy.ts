import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (!request.auth?.user?.role) {
    const loginUrl = new URL("/admin/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
