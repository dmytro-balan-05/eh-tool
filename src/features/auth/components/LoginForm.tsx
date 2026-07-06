"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const res = await signIn("credentials", { email, password, redirect: false });
        setLoading(false);
        if (res?.error) setError("Invalid credentials");
        else router.push("/");
    }

    const input =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h1 className="mb-5 text-lg font-semibold text-gray-900 dark:text-gray-100">Sign in</h1>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} required />
                    </div>
                    {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                        {loading ? "…" : "Sign in"}
                    </button>
                </form>

                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                    <button
                        disabled
                        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500"
                        title="Coming soon"
                    >
                        Sign in with Microsoft
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              Pending
            </span>
                    </button>
                </div>
            </div>
        </div>
    );
}