export type AsrOrder = {
    vin: string;
    lot: string;
    price: string;
    origin: string;
    destination: string;
};

export function parseAsrOrder(text: string): AsrOrder {
    const out: AsrOrder = { vin: "", lot: "", price: "", origin: "", destination: "" };

    const vinLine = text
        .split("\n")
        .map((l) => l.trim())
        .find((l) => !/^(?:Copart|IAA)\b/i.test(l) && /^[A-HJ-NPR-Z0-9]{8,17}$/i.test(l));
    if (vinLine) out.vin = vinLine.toUpperCase();

    // Lot# — число после Copart / IAA
    const lot = text.match(/\b(?:Copart|IAA)\s+(\d+)/i);
    if (lot) out.lot = lot[1];

    // Цена — $-число в строке прямо над строкой "Calc $..."
    const lines = text.split("\n").map((l) => l.trim());
    const calcIdx = lines.findIndex((l) => /^Calc\s*\$/i.test(l));
    if (calcIdx > 0) {
        const m = lines[calcIdx - 1].match(/\$\s*([\d,]+)/);
        if (m) out.price = m[1].replace(/,/g, "");
    }

    // Origin / Destination — колонки разделены табами при копировании из таблицы.
    const segments = text.split("\t");

    const extractAddress = (seg: string | undefined): string => {
        if (!seg) return "";
        const ls = seg.split("\n").map((x) => x.trim()).filter(Boolean);
        const cityIdx = ls.findIndex((l) => /,\s*[A-Z]{2}\s+\d{5}/.test(l));
        if (cityIdx === -1) return "";
        const street = ls[cityIdx - 1] ? ls[cityIdx - 1].replace(/,$/, "") : "";
        return `${street}, ${ls[cityIdx]}`.replace(/\s+/g, " ").trim();
    };

    const findSite = (): string => {
        const parts = text.split(/[\t\n]/).map((l) => l.trim());
        for (const l of parts) {
            if (!/^(?:Copart|IAA)\b/i.test(l)) continue;
            if (/logo/i.test(l)) continue;
            if (/^(?:Copart|IAA)\s+\d/i.test(l)) continue;
            return l.replace(/\s+/g, " ").trim();
        }
        return "";
    };
    const siteLabel = findSite();

    const addresses = segments.map(extractAddress).filter(Boolean);
    const originAddr = addresses[0] || "";
    out.origin = siteLabel && originAddr ? `${siteLabel}, ${originAddr}` : originAddr;
    out.destination = addresses[1] || "";
    return out;
}