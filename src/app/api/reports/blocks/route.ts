import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import { addBlock, updateBlock, deleteBlock } from "@/features/reports/report.service";

async function userId() {
    const session = await auth();
    return session?.user?.id ?? null;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body?.section || !body?.text) {
        return NextResponse.json({ error: "section and text required" }, { status: 400 });
    }
    const date = body.date || today();
    return NextResponse.json(await addBlock(uid, date, { section: body.section, text: body.text, vin: body.vin }));
}

export async function PATCH(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const updated = await updateBlock(uid, body.id, {
        text: body.text,
        section: body.section,
        sortOrder: body.sortOrder,
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = req.nextUrl.searchParams.get("id") ?? "";
    const ok = await deleteBlock(uid, id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";