"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseCarriers } from "@/features/offer/lib/parseCarriers";
import { OutputBlock } from "@/features/offer/components/OutputBlock";
type Warehouse = { id: string; code: string; city: string | null; address: string };

export default function Home() {
    const [mode, setMode] = useState<"domestic" | "international">("domestic");
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

    // Warehouses
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [warehouseId, setWarehouseId] = useState("");
    const [showManage, setShowManage] = useState(false);
    const [newCode, setNewCode] = useState("");
    const [newCity, setNewCity] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [whError, setWhError] = useState("");

    async function loadWarehouses() {
        try {
            const res = await fetch("/api/warehouses");
            const data = await res.json();
            if (Array.isArray(data)) setWarehouses(data);
        } catch {}
    }
    useEffect(() => { loadWarehouses(); }, []);

    // Theme
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
    const selectedWarehouse = warehouses.find((w) => w.id === warehouseId);

    const destination =
        mode === "international"
            ? selectedWarehouse
                ? `${selectedWarehouse.code} ${selectedWarehouse.address}`
                : ""
            : delivery;

    const note = carriers.length
        ? "Offered to:\n" + carriers.map((c) => `${c.companyName} ${c.phone}`).join("\n")
        : "";

    const message =
        `Hello. Can you pick up ${vehicle || "___"} from ${pickup || "___"} to ${destination || "___"} for ACH payment $${price || "___"}.` +
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
        if (vin.trim().length === 17 && vin.trim() !== lastDecoded.current) decodeVin(vin);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vin]);

    async function addWarehouse() {
        setWhError("");
        const code = newCode.trim(), city = newCity.trim(), address = newAddress.trim();
        if (!code || !address) { setWhError("Code and address are required"); return; }
        try {
            const res = await fetch("/api/warehouses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, city, address }),
            });
            const data = await res.json();
            if (!res.ok) { setWhError(data.error || "Failed"); return; }
            setNewCode(""); setNewCity(""); setNewAddress("");
            await loadWarehouses();
            setWarehouseId(data.id);
        } catch {
            setWhError("Network error");
        }
    }

    async function deleteWarehouse(id: string) {
        if (!confirm("Delete this warehouse?")) return;
        try {
            await fetch(`/api/warehouses?id=${id}`, { method: "DELETE" });
            if (warehouseId === id) setWarehouseId("");
            await loadWarehouses();
        } catch {}
    }

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
                {/* Mode toggle */}
                <div className="inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-700">
                    {(["domestic", "international"] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
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
                        {mode === "domestic" && (
                            <div>
                                <label className={label}>To (opt.)</label>
                                <input value={delivery} onChange={(e) => setDelivery(e.target.value)} className={input} placeholder="MTL-TX" />
                            </div>
                        )}
                        <div>
                            <label className={label}>Price $</label>
                            <input value={price} onChange={(e) => setPrice(e.target.value)} className={input} placeholder="1200" />
                        </div>
                    </div>

                    {/* Warehouse (international only) */}
                    {mode === "international" && (
                        <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between">
                                <label className={label + " mb-0"}>Warehouse (To)</label>
                                <button
                                    onClick={() => setShowManage((s) => !s)}
                                    className="text-xs text-teal-600 hover:underline dark:text-teal-400"
                                >
                                    {showManage ? "Close" : "Manage"}
                                </button>
                            </div>
                            <select
                                value={warehouseId}
                                onChange={(e) => setWarehouseId(e.target.value)}
                                className={input}
                            >
                                <option value="">— select warehouse —</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.code}{w.city ? ` — ${w.city}` : ""}
                                    </option>
                                ))}
                            </select>
                            {selectedWarehouse && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{selectedWarehouse.address}</p>
                            )}

                            {showManage && (
                                <div className="mt-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                    <ul className="mb-3 space-y-1">
                                        {warehouses.map((w) => (
                                            <li key={w.id} className="flex items-center justify-between text-sm">
                        <span>
                          <span className="font-medium">{w.code}</span>{" "}
                            <span className="text-gray-500 dark:text-gray-400">{w.address}</span>
                        </span>
                                                <button
                                                    onClick={() => deleteWarehouse(w.id)}
                                                    className="ml-2 rounded px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                                    title="Delete"
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input value={newCode} onChange={(e) => setNewCode(e.target.value)} className={input} placeholder="Code (MTL-XX)" />
                                        <input value={newCity} onChange={(e) => setNewCity(e.target.value)} className={input} placeholder="City (opt.)" />
                                        <input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className={input} placeholder="Full address" />
                                    </div>
                                    {whError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{whError}</p>}
                                    <button
                                        onClick={addWarehouse}
                                        className="mt-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
                                    >
                                        Add warehouse
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Carriers */}
                <section className={card}>
                    <div className="mb-1 flex items-center justify-between">
                        <label className={label + " mb-0"}>Carriers - paste from ACP</label>
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
