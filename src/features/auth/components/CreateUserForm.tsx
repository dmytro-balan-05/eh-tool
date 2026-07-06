"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
    id: string;
    email: string;
    role: "ADMIN" | "USER";
    mustChangePassword: boolean;
};

export function CreateUserForm() {
    const [users, setUsers] = useState<User[]>([]);
    const [email, setEmail] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [loading, setLoading] = useState(false);

    async function load() {
        const res = await fetch("/api/admin/users");
        if (res.ok) setUsers(await res.json());
    }
    useEffect(() => { load(); }, []);

    async function createUser(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setNotice("");
        setLoading(true);
        const res = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, tempPassword }),
        });
        const data = await res.json();
        setLoading(false);
        if (!res.ok) { setError(data.error || "Failed"); return; }
        setNotice(`Created ${data.email}. Share the temporary password with them.`);
        setEmail("");
        setTempPassword("");
        load();
    }

    async function removeUser(id: string, userEmail: string) {
        if (!confirm(`Delete ${userEmail}?`)) return;
        const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to delete");
            return;
        }
        load();
    }

    const input =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
    const label = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";
    const card =
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900";

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-semibold">User Management</h1>
                    <Link
                        href="/"
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        ← Back
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
                {/* Create */}
                <section className={card}>
                    <h2 className="mb-4 text-sm font-semibold">Create user</h2>
                    <form onSubmit={createUser} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={label}>Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} required />
                            </div>
                            <div>
                                <label className={label}>Temporary password</label>
                                <input type="text" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} className={input} required />
                            </div>
                        </div>
                        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                        {notice && <p className="text-xs text-teal-600 dark:text-teal-400">✓ {notice}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                            {loading ? "…" : "Create user"}
                        </button>
                    </form>
                </section>

                {/* List */}
                <section className={card}>
                    <h2 className="mb-3 text-sm font-semibold">All users ({users.length})</h2>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.map((u) => (
                            <li key={u.id} className="flex items-center justify-between py-2.5">
                                <div>
                                    <span className="text-sm font-medium">{u.email}</span>
                                    <div className="mt-0.5 flex gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        u.role === "ADMIN"
                            ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {u.role}
                    </span>
                                        {u.mustChangePassword && (
                                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        pending first login
                      </span>
                                        )}
                                    </div>
                                </div>
                                {u.role !== "ADMIN" && (
                                    <button
                                        onClick={() => removeUser(u.id, u.email)}
                                        className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950"
                                    >
                                        Delete
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}