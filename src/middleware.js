import { NextResponse } from "next/server";

export default async function middleware(request) {
  try {
    const authToken = request.cookies.get("next-auth.session-token")?.value;
    const url = new URL(request.url);
    const origin = url.origin;
    const pathname = url.pathname;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-url", request.url);
    requestHeaders.set("x-origin", origin);
    requestHeaders.set("x-pathname", pathname);

    if (!authToken) {
      if (request.nextUrl.pathname.startsWith("/login")) {
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else if (request.nextUrl.pathname.startsWith("/api/user/signin")) {
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        if (request.nextUrl.pathname.startsWith("/api")) {
          return NextResponse.json(
            { error: "NOT AUTHENTICATED" },
            { status: 403 },
          );
        } else {
          return NextResponse.redirect(new URL("/login", request.url), {
            headers: requestHeaders,
          });
        }
      }
    } else {
      if (request.nextUrl.pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/", request.url), {
          headers: requestHeaders,
        });
      } else {
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    }
  } catch (e) {
    console.error("ERROR IN MIDDLEWARE:", e.message);
    return NextResponse.error();
  }
}

export const config = {
  matcher: ["/((?!api/auth|forbidden|_next/static|_next/image|favicon.ico).*)"],
};
