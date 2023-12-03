import { NextResponse } from "next/server";

export default async function middleware(request) {
  try {
    const authToken = request.cookies.get("next-auth.csrf-token")?.value;

    const url = new URL(request.url);
    const origin = url.origin;
    const pathname = url.pathname;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-url", request.url);
    requestHeaders.set("x-origin", origin);
    requestHeaders.set("x-pathname", pathname);


    return NextResponse.next({
        request: {
            headers: requestHeaders
        }
    });


  } catch (e) {
    console.error("ERROR IN MIDDLEWARE:", e.message);
    return NextResponse.error();
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
