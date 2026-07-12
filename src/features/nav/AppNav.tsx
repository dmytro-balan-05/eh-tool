"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/features/offer/hooks/useTheme";

const TABS = [
    { href: "/", label: "Offer" },
    { href: "/requests", label: "Requests" },
    { href: "/report", label: "Report" },
    { href: "/routines", label: "Routines" },
    { href: "/offers", label: "My Offers" },
    { href: "/how-to", label: "How to use" },

];

export function AppNav() {
    const pathname = usePathname();
    const { theme, toggle } = useTheme();
    const { data: session } = useSession();
    const role = (session?.user as { role?: string } | undefined)?.role;

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
                <Link href="/" className="shrink-0 font-bold tracking-tight">
                    EH <span className="text-teal-600 dark:text-teal-400">Tool</span>
                </Link>

                <nav className="flex items-center gap-1">
                    {TABS.map((t) => (
                        <Link
                            key={t.href}
                            href={t.href}
                            className={`rounded-lg px-3 py-1.5 text-sm transition ${
                                isActive(t.href)
                                    ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            }`}
                        >
                            {t.label}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    {session?.user && (
                        <span className="hidden text-xs text-gray-500 md:inline dark:text-gray-400">
              {session.user.email}
            </span>
                    )}
                    {role === "ADMIN" && (
                        <Link
                            href="/admin/users"
                            className={`rounded-lg px-3 py-1.5 text-sm ${
                                isActive("/admin/users")
                                    ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                    : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                            }`}
                        >
                            Users
                        </Link>
                    )}
                    <button
                        onClick={toggle}
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        title="Toggle theme"
                    >
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>
                    {session?.user && (
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Sign out
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}