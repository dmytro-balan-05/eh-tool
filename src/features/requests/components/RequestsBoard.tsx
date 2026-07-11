"use client";
import { useMemo, useState } from "react";
import { useRequests, type RequestSource, type RequestStatus } from "../hooks/useRequests";
import { parseRequestsBlock } from "../lib/parseRequests";
import { RequestCard } from "./RequestCard";

type Filter = "ALL" | "NEW" | "FOLLOWUP" | "RESOLVED";

function PasteBox({
                      label,
                      source,
                      onAdd,
                  }: {
    label: string;
    source: RequestSource;
    onAdd: (source: RequestSource, text: string) => Promise<void>;
}) {
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit() {
        if (!text.trim()) return;
        setBusy(true);
        await onAdd(source, text);
        setText("");
        setBusy(false);
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">{label}</div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="h-24 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Paste requests — VIN + text, one per line…"
            />
            <button
                onClick={submit}
                disabled={busy}
                className="mt-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
                {busy ? "…" : "Add requests"}
            </button>
        </div>
    );
}

export function RequestsBoard() {
    const { requests, loading, create, update, remove } = useRequests();
    const [filter, setFilter] = useState<Filter>("ALL");

    async function addFrom(source: RequestSource, text: string) {
        const parsed = parseRequestsBlock(text);
        if (parsed.length === 0) return;
        await create(parsed.map((p) => ({ vin: p.vin, text: p.text, source, tags: p.tags })));
    }

    function toggleTag(id: string, tag: string) {
        const req = requests.find((r) => r.id === id);
        if (!req) return;
        const tags = req.tags.includes(tag) ? req.tags.filter((t) => t !== tag) : [...req.tags, tag];
        update(id, { tags });
    }

    const filtered = useMemo(() => {
        if (filter === "ALL") return requests;
        if (filter === "NEW") return requests.filter((r) => r.status === "NEW");
        if (filter === "FOLLOWUP") return requests.filter((r) => r.status === "CALLED_NO_ANSWER");
        return requests.filter((r) => r.status === "RESOLVED");
    }, [requests, filter]);

    const counts = useMemo(
        () => ({
            open: requests.filter((r) => r.status !== "RESOLVED").length,
            followup: requests.filter((r) => r.status === "CALLED_NO_ANSWER").length,
        }),
        [requests],
    );

    const tab = (f: Filter, label: string) => (
        <button
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs ${
                filter === f
                    ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
        >
            {label}
        </button>
    );

    return (
        <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            <div className="flex items-center justify-between">
            <span/>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {counts.open} open · {counts.followup} follow-up
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PasteBox label="International Team" source="INTERNATIONAL" onAdd={addFrom} />
                <PasteBox label="Customer Service" source="CUSTOMER_SERVICE" onAdd={addFrom} />
            </div>

            <div className="flex gap-1.5">
                {tab("ALL", "All")}
                {tab("NEW", "New")}
                {tab("FOLLOWUP", "Follow-up")}
                {tab("RESOLVED", "Resolved")}
            </div>

            <div className="space-y-2.5">
                {loading && <p className="text-sm text-gray-400">Loading…</p>}
                {!loading && filtered.length === 0 && (
                    <p className="py-8 text-center text-sm text-gray-400">No requests here.</p>
                )}
                {filtered.map((r) => (
                    <RequestCard
                        key={r.id}
                        req={r}
                        onStatus={(id, status: RequestStatus) => update(id, { status })}
                        onToggleTag={toggleTag}
                        onDelete={remove}
                    />
                ))}
            </div>
        </main>
    );
}