"use client";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ReportBlock, ReportSection as Section } from "../hooks/useReport";

const KIND_BADGE: Record<string, { label: string; cls: string }> = {
    AUTO: { label: "auto", cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400" },
    ROUTINE: { label: "routine", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
};

export function ReportSectionColumn({
                                        title,
                                        section,
                                        blocks,
                                        onAdd,
                                        onUpdate,
                                        onDelete,
                                    }: {
    title: string;
    section: Section;
    blocks: ReportBlock[];
    onAdd: (section: Section, text: string) => void;
    onUpdate: (id: string, data: { text: string }) => void;
    onDelete: (id: string) => void;
}) {
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState("");
    const { setNodeRef, isOver } = useDroppable({ id: `section:${section}` });

    function submit() {
        if (draft.trim()) onAdd(section, draft.trim());
        setDraft("");
        setAdding(false);
    }

    return (
        <div
            ref={setNodeRef}
            className={`flex min-h-[120px] flex-col rounded-xl p-3 transition ${
                isOver ? "bg-teal-50 dark:bg-teal-950/30" : "bg-gray-50 dark:bg-gray-900/50"
            }`}
        >
            <div className="mb-2.5 px-1 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</div>

            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {blocks.map((b) => (
                        <BlockCard key={b.id} block={b} onUpdate={onUpdate} onDelete={onDelete} />
                    ))}
                </div>
            </SortableContext>

            {adding ? (
                <textarea
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={submit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            submit();
                        }
                    }}
                    className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-teal-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Type and press Enter…"
                />
            ) : (
                <button
                    onClick={() => setAdding(true)}
                    className="mt-2 rounded-lg px-1 py-1 text-left text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    + Add block
                </button>
            )}
        </div>
    );
}

function BlockCard({
                       block,
                       onUpdate,
                       onDelete,
                   }: {
    block: ReportBlock;
    onUpdate: (id: string, data: { text: string }) => void;
    onDelete: (id: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(block.text);
    const badge = KIND_BADGE[block.kind];

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    function save() {
        setEditing(false);
        if (text.trim() && text.trim() !== block.text) onUpdate(block.id, { text: text.trim() });
        else setText(block.text);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex gap-1.5 rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
            <button
                {...attributes}
                {...listeners}
                className="mt-0.5 shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing dark:text-gray-600"
                aria-label="Drag"
            >
                ⠿
            </button>

            <div className="min-w-0 flex-1">
                {editing ? (
                    <textarea
                        autoFocus
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={save}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                save();
                            }
                        }}
                        className="w-full resize-y rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                ) : (
                    <p
                        onClick={() => setEditing(true)}
                        className="cursor-text whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100"
                    >
                        {block.text}
                    </p>
                )}

                <div className="mt-1.5 flex items-center gap-2">
                    {badge && (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}>{badge.label}</span>
                    )}
                    <button
                        onClick={() => onDelete(block.id)}
                        className="ml-auto text-xs text-gray-300 opacity-0 transition group-hover:opacity-100 hover:text-red-500 dark:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}