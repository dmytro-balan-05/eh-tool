import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import {
    listRoutines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
} from "@/features/reports/routine.service";

async function userId() {
    const session = await auth();
    return session?.user?.id ?? null;
}

export async function GET() {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await listRoutines(uid));
}

export async function POST(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body?.text) return NextResponse.json({ error: "text required" }, { status: 400 });
    return NextResponse.json(await addRoutine(uid, { text: body.text, sections: body.section }));
}

export async function PATCH(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const updated = await updateRoutine(uid, body.id, {
        text: body.text,
        sections: body.section,
        active: body.active,
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = req.nextUrl.searchParams.get("id") ?? "";
    const ok = await deleteRoutine(uid, id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";