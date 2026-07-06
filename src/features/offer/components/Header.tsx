"use client";
import { AuthMenu } from "@/features/auth/components/AuthMenu";

type Props = {
    theme: "light" | "dark";
    onToggleTheme: () => void;
    onReset: () => void;
};

export function Header({ theme, onToggleTheme, onReset }: Props) {
    return (
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                <h1 className="text-lg font-semibold">Vehicle Offer</h1>
                <div className="flex items-center gap-2">
<a
                    href="/how-to"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" >
                    How to use
                </a>
                <AuthMenu />
                    <button
                        onClick={onToggleTheme}
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        title="Toggle theme"
                    >
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>
                    <button
                        onClick={onReset}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        New Offer
                    </button>
                </div>
            </div>
        </header>
    );
}