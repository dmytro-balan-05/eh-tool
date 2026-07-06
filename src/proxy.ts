import NextAuth from "next-auth";
import { authConfig } from "@/features/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    // req.auth содержит сессию (или null). добавлю позже.
});

export const config = {
    matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};