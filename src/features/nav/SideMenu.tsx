"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; pending?: boolean };
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
    {
        title: "Global",
        items: [
            { href: "/requests", label: "Requests" },
            { href: "/report", label: "Report" },
            { href: "/routines", label: "Routines" },
        ],
    },
    {
        title: "Domestic",
        items: [
            { href: "/?mode=domestic", label: "Offer" },
            { href: "/offers?mode=domestic", label: "My Offers" },
            { href: "/late-pickups?mode=domestic", label: "Late pickup", pending: true },
            { href: "/late?mode=domestic", label: "Late delivery", pending: true },
        ],
    },
    {
        title: "International",
        items: [
            { href: "/?mode=international", label: "Offer" },
            { href: "/offers?mode=international", label: "My Offers" },
            { href: "/late-pickups?mode=international", label: "Late pickup", pending: true },
            { href: "/late?mode=international", label: "Late delivery" },
        ],
    },
];

export function SideMenu() {
    const pathname = usePathname();
    const [hovered, setHovered] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [closed, setClosed] = useState<string[]>([]);

    const open = hovered || pinned;

    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function openMenu() {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setHovered(true);
    }

    function scheduleClose() {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setHovered(false), 300);
    }

    const toggleSection = (title: string) =>
        setClosed((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));

    return (
        <div
            className="relative shrink-0"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
        >
            <button
                onClick={() => setPinned((p) => !p)}
                className={`rounded-lg border px-2.5 py-1.5 text-sm transition ${
                    pinned
                        ? "border-teal-400 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                        : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                }`}
                aria-label="Menu"
            >
                ☰
            </button>

            {open && (
                <div className="absolute left-0 top-full z-30 w-60 pt-2">
                    <div className="rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">

                    {SECTIONS.map((section) => {
                        const isClosed = closed.includes(section.title);
                        return (
                            <div key={section.title} className="px-2 py-1">
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 hover:bg-gray-50 dark:text-gray-500 dark:hover:bg-gray-800"
                                >
                                    {section.title}
                                    <span className="text-gray-300 dark:text-gray-600">{isClosed ? "›" : "⌄"}</span>
                                </button>

                                {!isClosed &&
                                    section.items.map((item) => {
                                        const base = item.href.split("?")[0];
                                        const active = base === "/" ? pathname === "/" : pathname.startsWith(base);
                                        return (
                                            <Link
                                                key={section.title + item.href}
                                                href={item.href}
                                                onClick={() => setPinned(false)}
                                                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition ${
                                                    active
                                                        ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                                }`}
                                            >
                                                {item.label}
                                                {item.pending && (
                                                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            pending
                          </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                            </div>
                        );
                    })}
                </div>
                </div>
            )}
        </div>

    );
}