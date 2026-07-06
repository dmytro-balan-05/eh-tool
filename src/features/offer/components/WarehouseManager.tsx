"use client";
import { useState } from "react";
import { input } from "./styles";
import type { Warehouse } from "../types";

type Props = {
    warehouses: Warehouse[];
    onAdd: (input: { code: string; city: string; address: string }) => Promise<Warehouse>;
    onDelete: (id: string) => void;
    onAdded: (id: string) => void;
};

export function WarehouseManager({ warehouses, onAdd, onDelete, onAdded }: Props) {
    const [code, setCode] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");

    async function add() {
        setError("");
        if (!code.trim() || !address.trim()) {
            setError("Code and address are required");
            return;
        }
        try {
            const w = await onAdd({ code: code.trim(), city: city.trim(), address: address.trim() });
            setCode(""); setCity(""); setAddress("");
            onAdded(w.id);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed");
        }
    }

    return (
        <div className="mt-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <ul className="mb-3 space-y-1">
                {warehouses.map((w) => (
                    <li key={w.id} className="flex items-center justify-between text-sm">
            <span>
              <span className="font-medium">{w.code}</span>{" "}
                <span className="text-gray-500 dark:text-gray-400">{w.address}</span>
            </span>
                        <button
                            onClick={() => onDelete(w.id)}
                            className="ml-2 rounded px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Delete"
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
            <div className="grid grid-cols-3 gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} className={input} placeholder="Code (MTL-XX)" />
                <input value={city} onChange={(e) => setCity(e.target.value)} className={input} placeholder="City (opt.)" />
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={input} placeholder="Full address" />
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button
                onClick={add}
                className="mt-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
            >
                Add warehouse
            </button>
        </div>
    );
}