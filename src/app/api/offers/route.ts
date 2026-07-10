import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import { saveOffer, listMyOffers } from "@/features/offer/offer.service";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const offers = await listMyOffers(session.user.id);
    return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json().catch(() => null);
    if (!body?.vin) {
        return NextResponse.json({ error: "VIN is required" }, { status: 400 });
    }
    const result = await saveOffer(session.user.id, body);
    return NextResponse.json(result);
}

export const dynamic = "force-dynamic";