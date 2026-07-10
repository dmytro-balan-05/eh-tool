"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useMyOffers } from "../hooks/useMyOffers";

const ACP_URL = "https://www.easyhaul.com/eh-acp/order/vin-search";

export function OffersLog() {
    const { offers, loading } = useMyOffers();
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const s = q.trim().toUpperCase();
        if (!s) return offers;
        return offers.filter(
            (o) =>
                o.vin.includes(s) ||
                (o.make || "").toUpperCase().includes(s) ||
                (o.model || "").toUpperCase().includes(s),
        );
    }, [offers, q]);

    const fmtDate = (iso: string) =>
        new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

    const input =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";
    const card =
        "rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900";

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-semibold">My Offers</h1>
                    <Link
                        href="/"
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        ← Back
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className={input + " font-mono"}
                    placeholder="Search by VIN, make or model…"
                />

                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {loading ? "Loading…" : `${filtered.length} offer${filtered.length === 1 ? "" : "s"}`}
                </div>

                <div className={card}>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filtered.map((o) => (
                            <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm">{o.vin}</span>
                                    <a
                                        href={`${ACP_URL}/${o.vin}?type=vin`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-teal-600 hover:underline dark:text-teal-400"
                                        >
                                        ACP ↗
                                    </a>
                                </div>
                                <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                    {[o.year, o.make, o.model].filter(Boolean).join(" ") || "—"}
                                    {o.lotNumber ? ` · Lot#${o.lotNumber}` : ""}
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                            <div className="text-sm font-medium">${o.price}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{fmtDate(o.createdAt)}</div>
                                    </div>
                            </li>
                            ))}
                            </ul>
{!loading && filtered.length === 0 && (
        <div className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            {offers.length === 0 ? "No offers yet." : "Nothing matches your search."}
        </div>
    )}
</div>
</main>
</div>
);
}