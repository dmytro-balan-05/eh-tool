import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import {
    createUser,
    listUsers,
    deleteUser,
    AuthError,
} from "@/features/auth/auth.service";

async function requireAdmin() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    const id = session?.user?.id;
    if (role !== "ADMIN" || !id) return null;
    return id;
}

export async function GET() {
    const adminId = await requireAdmin();
    if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const users = await listUsers();
    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    const adminId = await requireAdmin();
    if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => null);
    const email = String(body?.email || "");
    const tempPassword = String(body?.tempPassword || "");

    try {
        const user = await createUser(email, tempPassword);
        return NextResponse.json(user, { status: 201 });
    } catch (e) {
        if (e instanceof AuthError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const adminId = await requireAdmin();
    if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id") ?? "";
    try {
        await deleteUser(id, adminId);
        return NextResponse.json({ ok: true });
    } catch (e) {
        if (e instanceof AuthError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}