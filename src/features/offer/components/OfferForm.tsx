"use client";
import { useMemo, useRef, useState } from "react";
import { parseCarriers } from "../lib/parseCarriers";
import { parseAsrOrder } from "../lib/parseAsrOrder";
import { useVinDecoder } from "../hooks/useVinDecoder";
import { useWarehouses } from "../hooks/useWarehouses";
import { ModeToggle } from "./ModeToggle";
import { VehicleSection } from "./VehicleSection";
import { DetailsSection } from "./DetailsSection";
import { CarriersSection } from "./CarriersSection";
import { OutputBlock } from "./OutputBlock";
import type { OfferMode } from "../types";

export function OfferForm() {
    const vind = useVinDecoder();
    const { warehouses, add, remove } = useWarehouses();

    const [mode, setMode] = useState<OfferMode>("domestic");
    const [lot, setLot] = useState("");
    const [pickup, setPickup] = useState("");
    const [delivery, setDelivery] = useState("");
    const [price, setPrice] = useState("");
    const [raw, setRaw] = useState("");
    const [warehouseId, setWarehouseId] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    const [showAsr, setShowAsr] = useState(false);
    const [asrText, setAsrText] = useState("");

    const savedVins = useRef<Set<string>>(new Set());

    const carriers = useMemo(() => parseCarriers(raw), [raw]);
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
        `Hello. Can you pick up ${vind.vehicle || "___"} from ${pickup || "___"} to ${destination || "___"} for ACH payment $${price || "___"}.` +
        (lot.trim() ? ` Lot#${lot.trim()}` : "");

    const offerComplete =
        vind.vin.trim().length > 0 &&
        vind.vehicle.trim().length > 0 &&
        pickup.trim().length > 0 &&
        destination.trim().length > 0 &&
        price.trim().length > 0 &&
        note.length > 0;

    function applyAsr(text: string) {
        setAsrText(text);
        const parsed = parseAsrOrder(text);
        if (parsed.vin) {
            vind.setVin(parsed.vin);
            vind.decodeVin(parsed.vin);
        }
        if (parsed.lot) setLot(parsed.lot);
        if (parsed.price) setPrice(parsed.price);
        if (parsed.origin) setPickup(parsed.origin);
        if (parsed.destination) setDelivery(parsed.destination);
    }

    async function saveOffer() {
        const vin = vind.vin.trim().toUpperCase();
        if (savedVins.current.has(vin)) return;
        savedVins.current.add(vin);
        try {
            await fetch("/api/offers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vin,
                    make: vind.make,
                    model: vind.model,
                    year: vind.year,
                    price,
                    lotNumber: lot,
                    pickupPlace: pickup,
                    deliveryPlace: destination,
                }),
            });
        } catch {}
    }

    async function copy(key: string, text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied((k) => (k === key ? null : k)), 1500);
        } catch {}
        if (key === "msg" && offerComplete) saveOffer();
    }

    function resetAll() {
        vind.reset();
        setLot(""); setPickup(""); setDelivery(""); setPrice(""); setRaw("");
        setAsrText("");
    }

    async function deleteWarehouse(id: string) {
        if (!confirm("Delete this warehouse?")) return;
        if (warehouseId === id) setWarehouseId("");
        await remove(id);
    }

    return (
        <div className="bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <main className="mx-auto max-w-5xl px-4 py-6">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-5">
                        <div className="flex items-center justify-between">
                            <ModeToggle mode={mode} onChange={setMode} />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowAsr((s) => !s)}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-gray-50 dark:border-gray-700 dark:text-teal-400 dark:hover:bg-gray-800"
                                >
                                    {showAsr ? "Close ACP" : "Paste from ACP"}
                                </button>
                                <button
                                    onClick={resetAll}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    New Offer
                                </button>
                            </div>
                        </div>

                        <VehicleSection
                            vin={vind.vin}
                            setVin={vind.setVin}
                            year={vind.year}
                            make={vind.make}
                            model={vind.model}
                            decoding={vind.decoding}
                            decodeError={vind.decodeError}
                            vehicle={vind.vehicle}
                            onDecode={() => vind.decodeVin()}
                        />

                        <DetailsSection
                            mode={mode}
                            lot={lot} setLot={setLot}
                            pickup={pickup} setPickup={setPickup}
                            delivery={delivery} setDelivery={setDelivery}
                            price={price} setPrice={setPrice}
                            warehouses={warehouses}
                            warehouseId={warehouseId}
                            setWarehouseId={setWarehouseId}
                            selectedWarehouse={selectedWarehouse}
                            onAddWarehouse={add}
                            onDeleteWarehouse={deleteWarehouse}
                        />

                        <CarriersSection raw={raw} setRaw={setRaw} detected={carriers.length} />

                        <div className="space-y-4">
                            {note && (
                                <OutputBlock label="ACP Note" text={note} keyName="note" copied={copied} onCopy={copy} />
                            )}
                            <OutputBlock label="Driver Message" text={message} keyName="msg" copied={copied} onCopy={copy} />
                        </div>
                    </div>

                    {showAsr && (
                        <div className="w-80 shrink-0">
                            <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Paste order from ACP
                                </label>
                                <p className="mb-2 text-[11px] text-gray-400 dark:text-gray-500">
                                    Domestic only. Fills VIN, price, lot#, from/to.
                                </p>
                                <textarea
                                    value={asrText}
                                    onChange={(e) => applyAsr(e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                    className="h-96 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    placeholder="Paste the copied order row here…"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}