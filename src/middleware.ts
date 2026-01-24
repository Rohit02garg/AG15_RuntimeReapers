import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const role = req.nextauth.token?.role;
        const path = req.nextUrl.pathname;

        if (path.startsWith("/manufacturer") && role !== "MANUFACTURER") {
            return NextResponse.rewrite(new URL("/login", req.url));
        }

        if (path.startsWith("/distributor") && role !== "DISTRIBUTOR") {
            return NextResponse.rewrite(new URL("/login", req.url));
        }

        // Legacy/Generic Admin protection
        if (path.startsWith("/admin") && role !== "MANUFACTURER") {
            return NextResponse.rewrite(new URL("/login", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = { matcher: ["/admin/:path*", "/manufacturer/:path*", "/distributor/:path*"] };
