"use client";
import { useMemo, useState } from "react";
import { parseCarriers } from "../lib/parseCarriers";
import { useTheme } from "../hooks/useTheme";
import { useVinDecoder } from "../hooks/useVinDecoder";
import { useWarehouses } from "../hooks/useWarehouses";
import { Header } from "./Header";
import { ModeToggle } from "./ModeToggle";
import { VehicleSection } from "./VehicleSection";
import { DetailsSection } from "./DetailsSection";
import { CarriersSection } from "./CarriersSection";
import { OutputBlock } from "./OutputBlock";
import type { OfferMode } from "../types";

export function OfferForm() {
    const { theme, toggle } = useTheme();
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

    async function copy(key: string, text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied((k) => (k === key ? null : k)), 1500);
        } catch {}
    }

    function resetAll() {
        vind.reset();
        setLot(""); setPickup(""); setDelivery(""); setPrice(""); setRaw("");
    }

    async function deleteWarehouse(id: string) {
        if (!confirm("Delete this warehouse?")) return;
        if (warehouseId === id) setWarehouseId("");
        await remove(id);
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <Header theme={theme} onToggleTheme={toggle} onReset={resetAll} />

            <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
                <ModeToggle mode={mode} onChange={setMode} />

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
            </main>
        </div>
    );
}