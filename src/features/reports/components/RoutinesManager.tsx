"use client";
import { useEffect, useState } from "react";

type Section = "DONE" | "PLAN" | "BLOCKERS";
type Routine = { id: string; text: string; sections: Section[]; active: boolean };

const SECTIONS: { key: Section; label: string }[] = [
    { key: "DONE", label: "Done" },
    { key: "PLAN", label: "Plan" },
    { key: "BLOCKERS", label: "Blockers" },
];

export function RoutinesManager() {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [text, setText] = useState("");
    const [sections, setSections] = useState<Section[]>(["PLAN"]);
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            const res = await fetch("/api/routines");
            if (res.ok) setRoutines(await res.json());
        } catch {}
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    function toggleSection(s: Section) {
        setSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    }

    async function add() {
        if (!text.trim() || sections.length === 0) return;
        await fetch("/api/routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text.trim(), sections }),
        });
        setText("");
        setSections(["PLAN"]);
        load();
    }

    async function toggleActive(r: Routine) {
        setRoutines((prev) => prev.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)));
        await fetch("/api/routines", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: r.id, active: !r.active }),
        });
    }

    async function remove(id: string) {
        setRoutines((prev) => prev.filter((x) => x.id !== id));
        await fetch(`/api/routines?id=${id}`, { method: "DELETE" });
    }

    const input =
        "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

    const chip = (active: boolean) =>
        `rounded-lg border px-3 py-2 text-sm transition ${
            active
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        }`;

    return (
        <main className="mx-auto max-w-2xl space-y-5 px-6 py-6">
            <div>
                <h1 className="text-lg font-semibold">Routines</h1>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Recurring items that &ldquo;Assemble draft&rdquo; adds to your report automatically each day.
                </p>
            </div>

            <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && add()}
                    className={input + " w-full"}
                    placeholder="e.g. Follow up on late deliveries"
                />
                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1.5">
                        {SECTIONS.map((s) => (
                            <button key={s.key} onClick={() => toggleSection(s.key)} className={chip(sections.includes(s.key))}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={add}
                        disabled={!text.trim() || sections.length === 0}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                {loading ? (
                    <p className="px-4 py-6 text-sm text-gray-400">Loading…</p>
                ) : routines.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-gray-400">No routines yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {routines.map((r) => (
                            <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                                <button
                                    onClick={() => toggleActive(r)}
                                    className={`h-5 w-9 shrink-0 rounded-full transition ${
                                        r.active ? "bg-teal-600" : "bg-gray-300 dark:bg-gray-700"
                                    }`}
                                    title={r.active ? "Active" : "Paused"}
                                >
                  <span
                      className={`block h-4 w-4 rounded-full bg-white transition ${
                          r.active ? "translate-x-4" : "translate-x-0.5"
                      }`}
                  />
                                </button>
                                <span className={`flex-1 text-sm ${r.active ? "" : "text-gray-400 line-through"}`}>
                  {r.text}
                </span>
                                <div className="flex gap-1">
                                    {r.sections.map((s) => (
                                        <span
                                            key={s}
                                            className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                        >
                      {s.toLowerCase()}
                    </span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => remove(r.id)}
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