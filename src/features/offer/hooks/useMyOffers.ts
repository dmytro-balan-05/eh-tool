import { useEffect, useState } from "react";

export type OfferRecord = {
    id: string;
    vin: string;
    make: string | null;
    model: string | null;
    year: string | null;
    price: string;
    lotNumber: string | null;
    createdAt: string;
};

export function useMyOffers() {
    const [offers, setOffers] = useState<OfferRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/offers");
                if (res.ok) setOffers(await res.json());
            } catch {}
            setLoading(false);
        })();
    }, []);

    return { offers, loading };
}