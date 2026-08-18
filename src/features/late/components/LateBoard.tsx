"use client";
import { useCallback, useEffect, useState } from "react";

type Item = { id: string; vin: string; createdAt: string };
type AddResult = { added: number; duplicates: number; skipped: number };

const ACP_URL = "https://www.easyhaul.com/eh-acp/order/vin-search";

export function LateBoard() {
    const [items, setItems] = useState<Item[]>([]);
    const [weekStart, setWeekStart] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<AddResult | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/late");
            if (res.ok) {
                const data = await res.json();
                setItems(data.items);
                setWeekStart(data.weekStart);
            }
        } catch {}
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function submit(text: string) {
        if (!text.trim() || busy) return;
        setBusy(true);
        setResult(null);
        try {
            const res = await fetch("/api/late", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            if (res.ok) setResult(await res.json());
            await load();
        } catch {}
        setBusy(false);
    }

    function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
        const pasted = e.clipboardData.getData("text");
        if (!pasted.trim()) return;
        e.preventDefault();
        submit(pasted);
    }

    async function remove(id: string) {
        setItems((prev) => prev.filter((x) => x.id !== id));
        await fetch(`/api/late?id=${id}`, { method: "DELETE" });
    }

    const prettyWeek = weekStart
        ? new Date(`${weekStart}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "";

    return (
        <main className="mx-auto max-w-4xl space-y-5 px-6 py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">Late deliveries</h1>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        Week of {prettyWeek} · resets every Monday
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-semibold text-teal-600 dark:text-teal-400">{items.length}</div>
                    <div className="text-[11px] text-gray-400">this week</div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                    Paste the late deliveries page from ACP
                </div>
                <textarea
                    onPaste={onPaste}
                    className="h-32 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Paste here — VINs are extracted automatically…"
                />
                {busy && <p className="mt-2 text-xs text-gray-400">Processing…</p>}
                {result && (
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        Added <b className="text-teal-600 dark:text-teal-400">{result.added}</b>
                        {result.duplicates > 0 && <> · {result.duplicates} already counted</>}
                        {result.skipped > 0 && <> · {result.skipped} skipped (excluded carrier)</>}
                    </p>
                )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                {loading ? (
                    <p className="px-4 py-6 text-sm text-gray-400">Loading…</p>
                ) : items.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-gray-400">Nothing yet this week.</p>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {items.map((it) => (
                            <li key={it.id} className="flex items-center justify-between px-4 py-2.5">
                            <a
                                href={`${ACP_URL}/${it.vin}?type=vin`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-sm text-teal-700 hover:underline dark:text-teal-400"
                                >
                                {it.vin} ↗
                            </a>
                            <button
                            onClick={() => remove(it.id)}
                        className="text-xs text-gray-300 hover:text-red-500 dark:text-gray-600"
                    >
                        ✕
                    </button>
                    </li>
                    ))}
            </ul>
            )}
        </div>
</main>
);
}