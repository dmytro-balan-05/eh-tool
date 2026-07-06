import { useEffect, useState } from "react";
import type { Warehouse } from "../types";

export function useWarehouses() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    async function load() {
        try {
            const res = await fetch("/api/warehouses");
            const data = await res.json();
            if (Array.isArray(data)) setWarehouses(data);
        } catch {}
    }

    useEffect(() => { load(); }, []);

    async function add(input: { code: string; city: string; address: string }) {
        const res = await fetch("/api/warehouses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        await load();
        return data as Warehouse;
    }

    async function remove(id: string) {
        await fetch(`/api/warehouses?id=${id}`, { method: "DELETE" });
        await load();
    }

    return { warehouses, add, remove };
}