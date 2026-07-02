"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseCarriers } from "@/lib/parseCarriers";

export default function Home() {
    const [vin, setVin] = useState("");
    const [year, setYear] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [lot, setLot] = useState("");
    const [pickup, setPickup] = useState("");
    const [delivery, setDelivery] = useState("");
    const [price, setPrice] = useState("");
    const [raw, setRaw] = useState("");
    const [decoding, setDecoding] = useState(false);
    const [decodeError, setDecodeError] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const lastDecoded = useRef("");

    // Theme init: saved choice or system
    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const initial =
            saved === "dark" || saved === "light"
                ? saved
                : window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";
        setTheme(initial as "light" | "dark");
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);

    const carriers = useMemo(() => parseCarriers(raw), [raw]);
    const vehicle = [year, make, model].filter(Boolean).join(" ");

    const note = carriers.length
        ? "Offered to:\n" + carriers.map((c) => `${c.companyName} ${c.phone}`).join("\n")
        : "";

    const message =
        `Hello. Can you pick up ${vehicle || "___"} from ${pickup || "___"} to ${delivery || "___"} for ACH payment $${price || "___"}.` +
        (lot.trim() ? ` Lot#${lot.trim()}` : "");

    async function decodeVin(vinValue?: string) {
        const v = (vinValue ?? vin).trim();
        if (v.length < 11 || decoding || v === lastDecoded.current) return;
        lastDecoded.current = v;
        setDecodeError("");
        setDecoding(true);
        try {
            const res = await fetch(`/api/decode-vin?vin=${encodeURIComponent(v)}`);
            const data = await res.json();
            if (!res.ok) setDecodeError(data.error || "Error");
            else {
                setYear(data.year || "");
                setMake(data.make || "");
                setModel(data.model || "");
            }
        } catch {
            setDecodeError("Network error");
        }
        setDecoding(false);
    }

    useEffect(() => {
        if (vin.trim().length === 17 && vin.trim() !== lastDecoded.current) {
            decodeVin(vin);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vin]);

    async function copy(key: string, text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied((k) => (k === key ? null : k)), 1500);
        } catch {}
    }

    function resetAll() {
        setVin(""); setYear(""); setMake(""); setModel("");
        setLot(""); setPickup(""); setDelivery(""); setPrice("");
        setRaw(""); setDecodeError("");
        lastDecoded.current = "";
    }

    const input =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";
    const readonly =
        "w-full cursor-default rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300";
    const label = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";
    const card =
        "rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5 dark:border-gray-800 dark:bg-gray-900";

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-semibold">Vehicle Offer</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                            className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            title="Toggle theme"
                        >
                            {theme === "dark" ? "☀️" : "🌙"}
                        </button>
                        <button
                            onClick={resetAll}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            New Offer
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
                {/* Vehicle */}
                <section className={card}>
                    <label className={label}>VIN</label>
                    <div className="flex gap-2">
                        <input
                            value={vin}
                            onChange={(e) => setVin(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => decodeVin()}
                            onKeyDown={(e) => e.key === "Enter" && decodeVin()}
                            className={input + " font-mono uppercase"}
                            placeholder="5XYP34HC4LG026918"
                        />
                        <button
                            onClick={() => decodeVin()}
                            disabled={decoding}
                            className="whitespace-nowrap rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                            {decoding ? "…" : "Decode"}
                        </button>
                    </div>
                    {decodeError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{decodeError}</p>}
                    {vehicle && !decodeError && (
                        <p className="mt-1.5 text-xs text-teal-600 dark:text-teal-400">✓ {vehicle}</p>
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <div>
                            <label className={label}>Year</label>
                            <input value={year} readOnly tabIndex={-1} className={readonly} />
                        </div>
                        <div>
                            <label className={label}>Make</label>
                            <input value={make} readOnly tabIndex={-1} className={readonly} />
                        </div>
                        <div>
                            <label className={label}>Model</label>
                            <input value={model} readOnly tabIndex={-1} className={readonly} />
                        </div>
                    </div>
                </section>

                {/* Details */}
                <section className={card}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={label}>Lot# (opt.)</label>
                            <input value={lot} onChange={(e) => setLot(e.target.value)} className={input} />
                        </div>
                        <div>
                            <label className={label}>From (opt.)</label>
                            <input value={pickup} onChange={(e) => setPickup(e.target.value)} className={input} placeholder="Copart CA - Long Beach" />
                        </div>
                        <div>
                            <label className={label}>To (opt.)</label>
                            <input value={delivery} onChange={(e) => setDelivery(e.target.value)} className={input} placeholder="MTL-TX" />
                        </div>
                        <div>
                            <label className={label}>Price $</label>
                            <input value={price} onChange={(e) => setPrice(e.target.value)} className={input} placeholder="1200" />
                        </div>
                    </div>
                </section>

                {/* Carriers */}
                <section className={card}>
                    <div className="mb-1 flex items-center justify-between">
                        <label className={label + " mb-0"}>Carriers — paste from ACP</label>
                        {carriers.length > 0 && (
                            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">Detected: {carriers.length}</span>
                        )}
                    </div>
                    <textarea
                        value={raw}
                        onChange={(e) => setRaw(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className={input + " h-32 resize-y font-mono"}
                        placeholder="TVM Inc Regular   $500.00   (516) 324-8989"
                    />
                </section>

                {/* Outputs */}
                <div className="space-y-4">
                    {note && (
                        <OutputBlock label="ACP Note" text={note} keyName="note" copied={copied} onCopy={copy} />
                    )}
                    <OutputBlock label="Driver Message" text={message} keyName="msg" copied={copied} onCopy={copy} />
                </div>
            </main>
        </div>
    );
}

function OutputBlock({
                         label, text, keyName, copied, onCopy,
                     }: {
    label: string;
    text: string;
    keyName: string;
    copied: string | null;
    onCopy: (key: string, text: string) => void;
}) {
    const isCopied = copied === keyName;
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span className={`text-xs ${isCopied ? "text-teal-600 dark:text-teal-400" : "text-gray-400 dark:text-gray-500"}`}>
          {isCopied ? "Copied ✓" : "click to copy"}
        </span>
            </div>
            <button
                type="button"
                onClick={() => onCopy(keyName, text)}
                className={`w-full whitespace-pre-wrap rounded-lg border p-3 text-left font-mono text-sm transition ${
                    isCopied
                        ? "border-teal-400 bg-teal-50 text-gray-900 dark:border-teal-600 dark:bg-teal-950 dark:text-gray-100"
                        : "border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                }`}
            >
                {text}
            </button>
        </div>
    );
}