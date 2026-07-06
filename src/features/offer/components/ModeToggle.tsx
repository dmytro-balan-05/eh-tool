"use client";
import type { OfferMode } from "../types";

type Props = { mode: OfferMode; onChange: (m: OfferMode) => void };

export function ModeToggle({ mode, onChange }: Props) {
    return (
        <div className="inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-700">
            {(["domestic", "international"] as const).map((m) => (
                <button
                    key={m}
                    onClick={() => onChange(m)}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition ${
                        mode === m
                            ? "bg-teal-600 text-white"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                >
                    {m}
                </button>
            ))}
        </div>
    );
}