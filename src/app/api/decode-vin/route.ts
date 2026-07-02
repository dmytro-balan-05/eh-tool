import { NextRequest, NextResponse } from "next/server";

function titleCase(s: string): string {
    return s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export async function GET(req: NextRequest) {
    const vin = (req.nextUrl.searchParams.get("vin") || "").trim();
    if (vin.length < 11) {
        return NextResponse.json({ error: "Enter a full VIN" }, { status: 400 });
    }
    try {
        const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        const r = data?.Results?.[0] ?? {};
        const make = titleCase((r.Make || "").trim());
        const model = (r.Model || "").trim();
        const year = (r.ModelYear || "").trim();
        if (!make && !model && !year) {
            return NextResponse.json({ error: "VIN not recognized" }, { status: 404 });
        }
        return NextResponse.json({ make, model, year });
    } catch {
        return NextResponse.json({ error: "NHTSA request failed" }, { status: 500 });
    }
}