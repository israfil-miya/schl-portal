import { NextResponse } from "next/server";

export default async function middleware(request) {
  try {
    const authToken = request.cookies.get("next-auth.csrf-token")?.value;

    if (!authToken) {
      if (!(request.nextUrl.pathname == "/login")) {
        return NextResponse.redirect(
          new URL("/login?callbackUrl=" + request.nextUrl.pathname, request.url)
        );
      }
    } else {
      if (request.nextUrl.pathname == "/login") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (e) {
    console.error("ERROR IN MIDDLEWARE:", e);
    return NextResponse.error();
  }
}
export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
