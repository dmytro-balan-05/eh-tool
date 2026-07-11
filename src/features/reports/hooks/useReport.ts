import { useCallback, useEffect, useState } from "react";

export type ReportSection = "DONE" | "PLAN" | "BLOCKERS";
export type BlockKind = "MANUAL" | "AUTO" | "ROUTINE";

export type ReportBlock = {
    id: string;
    section: ReportSection;
    kind: BlockKind;
    text: string;
    vin: string | null;
    sortOrder: number;
};

export type Report = {
    id: string;
    date: string;
    blocks: ReportBlock[];
};

export function useReport(date: string) {
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [assembling, setAssembling] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports?date=${date}`);
            if (res.ok) setReport(await res.json());
        } catch {}
        setLoading(false);
    }, [date]);

    useEffect(() => {
        load();
    }, [load]);

    const assemble = useCallback(async () => {
        setAssembling(true);
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date }),
            });
            if (res.ok) setReport(await res.json());
        } catch {}
        setAssembling(false);
    }, [date]);

    const addBlock = useCallback(
        async (section: ReportSection, text: string) => {
            await fetch("/api/reports/blocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, section, text }),
            });
            await load();
        },
        [date, load],
    );

    const updateBlock = useCallback(
        async (id: string, data: { text?: string; section?: ReportSection; sortOrder?: number }) => {
            setReport((prev) =>
                prev ? { ...prev, blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...data } : b)) } : prev,
            );
            await fetch("/api/reports/blocks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...data }),
            });
        },
        [],
    );

    const deleteBlock = useCallback(
        async (id: string) => {
            setReport((prev) => (prev ? { ...prev, blocks: prev.blocks.filter((b) => b.id !== id) } : prev));
            await fetch(`/api/reports/blocks?id=${id}`, { method: "DELETE" });
        },
        [],
    );
    const reorder = useCallback(
        async (blocks: ReportBlock[]) => {
            setReport((prev) => (prev ? { ...prev, blocks } : prev));
            await fetch("/api/reports/blocks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: blocks.map((b) => ({ id: b.id, section: b.section, sortOrder: b.sortOrder })),
                }),
            });
        },
        [],
    );
    return { report, loading, assembling, assemble, addBlock, updateBlock, deleteBlock, reorder, reload: load };}