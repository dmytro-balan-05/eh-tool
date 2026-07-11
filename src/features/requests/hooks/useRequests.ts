import { useCallback, useEffect, useState } from "react";

export type RequestSource = "INTERNATIONAL" | "CUSTOMER_SERVICE";
export type RequestStatus = "NEW" | "CALLED_NO_ANSWER" | "RESOLVED";

export type RequestRecord = {
    id: string;
    vin: string | null;
    text: string;
    source: RequestSource;
    status: RequestStatus;
    tags: string[];
    createdAt: string;
};

export type NewRequestItem = {
    vin?: string | null;
    text: string;
    source: RequestSource;
    tags?: string[];
};

export function useRequests() {
    const [requests, setRequests] = useState<RequestRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/requests");
            if (res.ok) setRequests(await res.json());
        } catch {}
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const create = useCallback(
        async (items: NewRequestItem[]) => {
            await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });
            await load();
        },
        [load],
    );

    const update = useCallback(
        async (id: string, data: { status?: RequestStatus; tags?: string[] }) => {
            setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
            await fetch("/api/requests", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...data }),
            });
        },
        [],
    );

    const remove = useCallback(
        async (id: string) => {
            setRequests((prev) => prev.filter((r) => r.id !== id));
            await fetch(`/api/requests?id=${id}`, { method: "DELETE" });
        },
        [],
    );

    return { requests, loading, create, update, remove };
}