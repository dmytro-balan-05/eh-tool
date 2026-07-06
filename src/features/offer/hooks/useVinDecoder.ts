import { useEffect, useRef, useState } from "react";

export function useVinDecoder() {
    const [vin, setVin] = useState("");
    const [year, setYear] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [decoding, setDecoding] = useState(false);
    const [decodeError, setDecodeError] = useState("");
    const lastDecoded = useRef("");

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

    function reset() {
        setVin("");
        setYear("");
        setMake("");
        setModel("");
        setDecodeError("");
        lastDecoded.current = "";
    }

    const vehicle = [year, make, model].filter(Boolean).join(" ");

    return {
        vin, setVin, year, make, model,
        decoding, decodeError, decodeVin, vehicle, reset,
    };
}