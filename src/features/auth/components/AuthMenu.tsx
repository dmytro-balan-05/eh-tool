"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function AuthMenu() {
    const { data: session } = useSession();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user) return null;

    return (
        <div className="flex items-center gap-2">
      <span className="hidden text-xs text-gray-500 sm:inline dark:text-gray-400">
        {session.user.email}
      </span>
            {role === "ADMIN" && (
                <Link
                    href="/admin/users"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    Users
                </Link>
            )}
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
                Sign out
            </button>
        </div>
    );
}