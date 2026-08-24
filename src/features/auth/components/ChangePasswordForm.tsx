"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function ChangePasswordForm() {
    const router = useRouter();
    const { update } = useSession();
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (newPassword !== confirm) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        const res = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword: "", newPassword }),
        });
        const data = await res.json();

        if (!res.ok) {
            setLoading(false);
            setError(data.error || "Failed");
            return;
        }

        await update({ mustChangePassword: false });
        router.push("/how-to");
        router.refresh();
    }

    const input =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
    const label = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h1 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Set your password</h1>
                <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">
                    Choose a password before you start. At least 8 characters.
                </p>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className={label}>New password</label>
                        <input
                            type="password"
                            autoFocus
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={input}
                            required
                        />
                    </div>
                    <div>
                        <label className={label}>Confirm new password</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className={input}
                            required
                        />
                    </div>
                    {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                        {loading ? "…" : "Continue"}
                    </button>
                </form>
            </div>
        </div>
    );
}