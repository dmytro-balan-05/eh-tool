import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
export async function GET() {
    const warehouses = await prisma.warehouse.findMany({ orderBy: { code: "asc" } });
    return NextResponse.json(warehouses);
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const code = (body?.code || "").trim();
    const city = (body?.city || "").trim();
    const address = (body?.address || "").trim();
    if (!code || !address) {
        return NextResponse.json({ error: "Code and address are required" }, { status: 400 });
    }
    try {
        const w = await prisma.warehouse.create({
            data: { code, city: city || null, address },
        });
        return NextResponse.json(w, { status: 201 });
    } catch (e: unknown) {
        if ((e as { code?: string })?.code === "P2002") {
            return NextResponse.json({ error: "That code already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    try {
        await prisma.warehouse.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}