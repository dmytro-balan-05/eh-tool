import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import {
    listRequests,
    createRequests,
    updateRequest,
    deleteRequest,
} from "@/features/requests/request.service";

async function userId() {
    const session = await auth();
    return session?.user?.id ?? null;
}

export async function GET() {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await listRequests(uid));
}

export async function POST(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    const items = Array.isArray(body?.items) ? body.items : null;
    if (!items) return NextResponse.json({ error: "items[] required" }, { status: 400 });
    return NextResponse.json(await createRequests(uid, items));
}

export async function PATCH(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const updated = await updateRequest(uid, body.id, { status: body.status, tags: body.tags });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = req.nextUrl.searchParams.get("id") ?? "";
    const ok = await deleteRequest(uid, id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";