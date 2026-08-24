"use client";
import { useEffect, useState } from "react";

type Settings = {
    reportOffers: boolean;
    reportRequests: boolean;
    reportLateDel: boolean;
    reportLatePickups: boolean;
};

const ROWS: { key: keyof Settings; label: string; hint: string }[] = [
    { key: "reportOffers", label: "Offers", hint: "Offered N vehicles: VIN…" },
    { key: "reportRequests", label: "Requests", hint: "Int: N (Solved M), CS: …" },
    { key: "reportLateDel", label: "Late deliveries", hint: "Late deliveries this week: N" },
    { key: "reportLatePickups", label: "Late pickups", hint: "Late pickups this week: N" },
];

export function ReportSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/report-settings");
                if (res.ok) setSettings(await res.json());
            } catch {}
        })();
    }, []);

    async function toggle(key: keyof Settings) {
        if (!settings) return;
        const next = { ...settings, [key]: !settings[key] };
        setSettings(next);
        await fetch("/api/report-settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [key]: next[key] }),
        });
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold">What goes into my report</h2>
            <p className="mt-0.5 mb-3 text-xs text-gray-500 dark:text-gray-400">
                Turn off anything that isn&rsquo;t part of your job — it won&rsquo;t appear in the draft.
            </p>

            {!settings ? (
                <p className="text-sm text-gray-400">Loading…</p>
            ) : (
                <ul className="space-y-2">
                    {ROWS.map((row) => (
                        <li key={row.key} className="flex items-center gap-3">
                            <button
                                onClick={() => toggle(row.key)}
                                className={`h-5 w-9 shrink-0 rounded-full transition ${
                                    settings[row.key] ? "bg-teal-600" : "bg-gray-300 dark:bg-gray-700"
                                }`}
                            >
                <span
                    className={`block h-4 w-4 rounded-full bg-white transition ${
                        settings[row.key] ? "translate-x-4" : "translate-x-0.5"
                    }`}
                />
                            </button>
                            <div className="min-w-0">
                                <div className={`text-sm ${settings[row.key] ? "" : "text-gray-400"}`}>{row.label}</div>
                                <div className="text-[11px] text-gray-400 dark:text-gray-500">{row.hint}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}