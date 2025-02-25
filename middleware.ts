import { getSessionCookie } from "better-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request); // Optionally pass config as the second argument if cookie name or prefix is customized.
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard", "/settings"], // Specify the routes the middleware applies to
};
