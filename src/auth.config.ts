import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: { signIn: "/login" },
    providers: [],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role;
                token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
                (session.user as { mustChangePassword?: boolean }).mustChangePassword =
                    token.mustChangePassword as boolean;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;