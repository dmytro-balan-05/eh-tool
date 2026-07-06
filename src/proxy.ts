import NextAuth from "next-auth";
import { authConfig } from "@/features/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnLogin = req.nextUrl.pathname === "/login";

    // Не залогинен и идёт не на /login → на страницу входа
    if (!isLoggedIn && !isOnLogin) {
        return Response.redirect(new URL("/login", req.nextUrl));
    }

    // Уже залогинен, но открыл /login → на главную
    if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};