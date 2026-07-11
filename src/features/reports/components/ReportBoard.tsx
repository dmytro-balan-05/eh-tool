"use client";
import { useState } from "react";
import { useReport, type ReportSection } from "../hooks/useReport";
import { ReportSectionColumn } from "./ReportSection";

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number) {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

function prettyDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

export function ReportBoard() {
    const [date, setDate] = useState(todayStr());
    const { report, loading, assembling, assemble, addBlock, updateBlock, deleteBlock } = useReport(date);

    const bySection = (s: ReportSection) =>
        (report?.blocks ?? []).filter((b) => b.section === s).sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <main className="mx-auto max-w-6xl space-y-5 px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDate((d) => shiftDate(d, -1))}
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        ‹
                    </button>
                    <div className="min-w-[120px] text-center">
                        <div className="text-sm font-semibold">{prettyDate(date)}</div>
                        {date === todayStr() && <div className="text-[11px] text-gray-400">today</div>}
                    </div>
                    <button
                        onClick={() => setDate((d) => shiftDate(d, 1))}
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        ›
                    </button>
                </div>

                <button
                    onClick={assemble}
                    disabled={assembling}
                    className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                    {assembling ? "Assembling…" : "Assemble draft"}
                </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">
                &ldquo;Assemble draft&rdquo; pulls yesterday&rsquo;s offers, requests and your routines. Manual blocks are kept.
            </p>

            {loading ? (
                <p className="text-sm text-gray-400">Loading…</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ReportSectionColumn
                        title="Done yesterday"
                        section="DONE"
                        blocks={bySection("DONE")}
                        onAdd={addBlock}
                        onUpdate={updateBlock}
                        onDelete={deleteBlock}
                    />
                    <ReportSectionColumn
                        title="Plan today"
                        section="PLAN"
                        blocks={bySection("PLAN")}
                        onAdd={addBlock}
                        onUpdate={updateBlock}
                        onDelete={deleteBlock}
                    />
                    <ReportSectionColumn
                        title="Blockers / issues"
                        section="BLOCKERS"
                        blocks={bySection("BLOCKERS")}
                        onAdd={addBlock}
                        onUpdate={updateBlock}
                        onDelete={deleteBlock}
                    />
                </div>
            )}
        </main>
    );
}