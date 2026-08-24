import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import { mondayOf } from "@/features/late/late.service";
import {
    addLatePickups,
    listLatePickups,
    deleteLatePickup,
} from "@/features/late/pickup.service";

async function userId() {
    const session = await auth();
    return session?.user?.id ?? null;
}

export async function GET(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const weekStart = req.nextUrl.searchParams.get("weekStart") || mondayOf(new Date());
    const items = await listLatePickups(uid, weekStart);
    return NextResponse.json({ weekStart, items });
}

export async function POST(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body?.text) return NextResponse.json({ error: "text required" }, { status: 400 });
    return NextResponse.json(await addLatePickups(uid, body.text));
}

export async function DELETE(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = req.nextUrl.searchParams.get("id") ?? "";
    const ok = await deleteLatePickup(uid, id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";