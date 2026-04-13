import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { globalApiLimit, checkoutLimit, getIP } from './lib/ratelimit'

// Note: For Next.js to recognize this file globally, it must be named 'middleware.ts' and the function exported as 'middleware'.
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname.toLowerCase();

    // 1. Rate Limiting for API routes
    if (path.startsWith("/api")) {
        // Skip auth routes for special handling in their own handlers (due to body parsing needs)
        // But still apply global limit? User said "All /api routes"
        if (!path.startsWith("/api/auth/login") && !path.startsWith("/api/auth/signup")) {
            const ip = getIP(request);

            // Checkout specific limit
            const checkoutPaths = ["/api/checkout", "/api/create-payment-intent", "/api/orders"];
            if (checkoutPaths.includes(path)) {
                const { success } = await checkoutLimit.limit(`checkout:${ip}`);
                if (!success) {
                    return NextResponse.json(
                        { message: "Too many requests. Please slow down.", success: false }, 
                        { status: 429 }
                    );
                }
            }

            // Global API limit
            const { success } = await globalApiLimit.limit(`global:${ip}`);
            if (!success) {
                return NextResponse.json(
                    { message: "Too many requests. Please slow down.", success: false }, 
                    { status: 429 }
                );
            }
        }
    }

    // 2. Define Public Auth Paths (Logins, Signups, Password Resets)
    const publicPaths = [
        "/auth/login",
        "/auth/signup",
        "/auth/checkemail",
        "/auth/verifyemail",
        "/auth/newpassword",
    ];

    const isPublicPath = publicPaths.includes(path);
    const token = request.cookies.get("Accesstoken")?.value || "";

    // Rule: If a user has a token, prevent them from accessing Login/Signup pages again.
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL("/auth/profile", request.url));
    }

    // 3. Define Protected Path Prefixes
    // Any path that STARTS with these strings will require a token.
    const protectedPrefixes = [
        "/auth/profile",
        "/cart",
        "/store",
        "/admin",
        "/products/my-orders"
    ];

    const isProtectedPath = protectedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));

    // Rule: If the user is trying to access a protected area without a token, boot them to login.
    if (isProtectedPath && !token) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Pass-through
    return NextResponse.next();
}

// 4. Global Matcher Config
// We configure the middleware to run on EVERYTHING EXCEPT static assets (_next).
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$).*)',
    ]
}
