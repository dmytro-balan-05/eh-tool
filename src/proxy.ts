import NextAuth from "next-auth";
import { authConfig } from "@/features/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const mustChange = !!(req.auth?.user as { mustChangePassword?: boolean } | undefined)?.mustChangePassword;
    const path = req.nextUrl.pathname;
    const isOnLogin = path === "/login";
    const isOnChangePassword = path === "/change-password";

    if (!isLoggedIn && !isOnLogin) {
        return Response.redirect(new URL("/login", req.nextUrl));
    }

    if (isLoggedIn && mustChange && !isOnChangePassword) {
        return Response.redirect(new URL("/change-password", req.nextUrl));
    }

    if (isLoggedIn && !mustChange && (isOnLogin || isOnChangePassword)) {
        return Response.redirect(new URL("/", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};