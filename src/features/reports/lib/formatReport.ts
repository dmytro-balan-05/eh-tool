import type { ReportBlock } from "../hooks/useReport";

const SECTION_TITLES: { key: "DONE" | "PLAN" | "BLOCKERS"; title: string }[] = [
    { key: "DONE", title: "What was done yesterday" },
    { key: "PLAN", title: "Plan for today" },
    { key: "BLOCKERS", title: "Blockers / Issues" },
];

export function formatReport(blocks: ReportBlock[]): string {
    const parts: string[] = [];

    for (const { key, title } of SECTION_TITLES) {
        const items = blocks
            .filter((b) => b.section === key)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        parts.push(title + ":");
        if (items.length === 0) {
            parts.push("- —");
        } else {
            for (const b of items) parts.push(`- ${b.text}`);
        }
        parts.push("");
    }

    return parts.join("\n").trim();
}