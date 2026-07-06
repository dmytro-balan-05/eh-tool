"use client";
import { useState } from "react";
import { input, label, card } from "./styles";
import { WarehouseManager } from "./WarehouseManager";
import type { OfferMode, Warehouse } from "../types";

type Props = {
    mode: OfferMode;
    lot: string; setLot: (v: string) => void;
    pickup: string; setPickup: (v: string) => void;
    delivery: string; setDelivery: (v: string) => void;
    price: string; setPrice: (v: string) => void;
    warehouses: Warehouse[];
    warehouseId: string;
    setWarehouseId: (id: string) => void;
    selectedWarehouse: Warehouse | undefined;
    onAddWarehouse: (input: { code: string; city: string; address: string }) => Promise<Warehouse>;
    onDeleteWarehouse: (id: string) => void;
};

export function DetailsSection(p: Props) {
    const [showManage, setShowManage] = useState(false);

    return (
        <section className={card}>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={label}>Lot# (opt.)</label>
                    <input value={p.lot} onChange={(e) => p.setLot(e.target.value)} className={input} />
                </div>
                <div>
                    <label className={label}>From (opt.)</label>
                    <input value={p.pickup} onChange={(e) => p.setPickup(e.target.value)} className={input} placeholder="Copart CA - Long Beach" />
                </div>
                {p.mode === "domestic" && (
                    <div>
                        <label className={label}>To (opt.)</label>
                        <input value={p.delivery} onChange={(e) => p.setDelivery(e.target.value)} className={input} placeholder="MTL-TX" />
                    </div>
                )}
                <div>
                    <label className={label}>Price $</label>
                    <input value={p.price} onChange={(e) => p.setPrice(e.target.value)} className={input} placeholder="1200" />
                </div>
            </div>

            {p.mode === "international" && (
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
                        value={p.warehouseId}
                        onChange={(e) => p.setWarehouseId(e.target.value)}
                        className={input}
                    >
                        <option value="">— select warehouse —</option>
                        {p.warehouses.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.code}{w.city ? ` — ${w.city}` : ""}
                            </option>
                        ))}
                    </select>
                    {p.selectedWarehouse && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{p.selectedWarehouse.address}</p>
                    )}

                    {showManage && (
                        <WarehouseManager
                            warehouses={p.warehouses}
                            onAdd={p.onAddWarehouse}
                            onDelete={p.onDeleteWarehouse}
                            onAdded={p.setWarehouseId}
                        />
                    )}
                </div>
            )}
        </section>
    );
}