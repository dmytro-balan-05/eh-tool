"use client";
import { useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useReport, type ReportSection, type ReportBlock } from "../hooks/useReport";
import { ReportSectionColumn } from "./ReportSection";
import { formatReport } from "../lib/formatReport";
import Link from "next/link";


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

const SECTIONS: { key: ReportSection; title: string }[] = [
    { key: "DONE", title: "Done yesterday" },
    { key: "PLAN", title: "Plan today" },
    { key: "BLOCKERS", title: "Blockers / issues" },
];

export function ReportBoard() {
    const [date, setDate] = useState(todayStr());
    const { report, loading, assembling, assemble, addBlock, updateBlock, deleteBlock, reorder } = useReport(date);
    const [activeId, setActiveId] = useState<string | null>(null);

    const [copied, setCopied] = useState(false);

    async function copyReport() {
        try {
            await navigator.clipboard.writeText(formatReport(blocks));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {}
    }

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const blocks = report?.blocks ?? [];
    const bySection = (s: ReportSection) =>
        blocks.filter((b) => b.section === s).sort((a, b) => a.sortOrder - b.sortOrder);

    const activeBlock = blocks.find((b) => b.id === activeId) || null;

    function sectionOf(id: string): ReportSection | null {
        if (id.startsWith("section:")) return id.slice("section:".length) as ReportSection;
        return blocks.find((b) => b.id === id)?.section ?? null;
    }

    function onDragStart(e: DragStartEvent) {
        setActiveId(String(e.active.id));
    }

    function onDragEnd(e: DragEndEvent) {
        setActiveId(null);
        const { active, over } = e;
        if (!over) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);
        const fromSection = sectionOf(activeIdStr);
        const toSection = sectionOf(overIdStr);
        if (!fromSection || !toSection) return;

        const activeBlocks = bySection(fromSection);
        const targetBlocks = fromSection === toSection ? activeBlocks : bySection(toSection);

        const oldIndex = activeBlocks.findIndex((b) => b.id === activeIdStr);
        let newIndex = targetBlocks.findIndex((b) => b.id === overIdStr);
        if (newIndex === -1) newIndex = targetBlocks.length;

        let reordered: ReportBlock[];

        if (fromSection === toSection) {
            const moved = arrayMove(activeBlocks, oldIndex, newIndex);
            reordered = moved.map((b, i) => ({ ...b, sortOrder: i }));
        } else {
            const moving = { ...activeBlocks[oldIndex], section: toSection };
            const newTarget = [...targetBlocks];
            newTarget.splice(newIndex, 0, moving);
            const newFrom = activeBlocks.filter((b) => b.id !== activeIdStr).map((b, i) => ({ ...b, sortOrder: i }));
            const newTo = newTarget.map((b, i) => ({ ...b, sortOrder: i, section: toSection }));
            const untouched = blocks.filter((b) => b.section !== fromSection && b.section !== toSection);
            reorder([...untouched, ...newFrom, ...newTo]);
            return;
        }

        const untouched = blocks.filter((b) => b.section !== fromSection);
        reorder([...untouched, ...reordered]);
    }

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

                <div className="flex items-center gap-2">
                    <Link
                        href="/routines"
                        className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        Routines
                    </Link>
                    <button
                        onClick={copyReport}
                        className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        {copied ? "Copied ✓" : "Copy to Slack"}
                    </button>
                    <button
                        onClick={assemble}
                        disabled={assembling}
                        className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                        {assembling ? "Assembling…" : "Assemble draft"}
                    </button>
                </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">
                &ldquo;Assemble draft&rdquo; pulls yesterday&rsquo;s offers, requests and your routines. Manual blocks are kept. Drag ⠿ to reorder or move between sections.
            </p>

            {loading ? (
                <p className="text-sm text-gray-400">Loading…</p>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {SECTIONS.map((s) => (
                            <ReportSectionColumn
                                key={s.key}
                                title={s.title}
                                section={s.key}
                                blocks={bySection(s.key)}
                                onAdd={addBlock}
                                onUpdate={updateBlock}
                                onDelete={deleteBlock}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeBlock ? (
                            <div className="rounded-lg border border-gray-200 bg-white p-2.5 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                {activeBlock.text}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </main>
    );
}