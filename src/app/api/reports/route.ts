import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import { getOrCreateReport, assembleDraft } from "@/features/reports/report.service";

async function userId() {
    const session = await auth();
    return session?.user?.id ?? null;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const date = req.nextUrl.searchParams.get("date") || today();
    return NextResponse.json(await getOrCreateReport(uid, date));
}

export async function POST(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    const date = body?.date || today();
    return NextResponse.json(await assembleDraft(uid, date));
}

export const dynamic = "force-dynamic";